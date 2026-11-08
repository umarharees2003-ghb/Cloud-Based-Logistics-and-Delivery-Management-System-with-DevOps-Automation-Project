const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const deliveryScope = require("./deliveryScope");

class ReportService {
  /**
   * Get high-level operational summary
   */
  async getDashboardSummary(user = null) {
    const filter = await deliveryScope(user);

    const [groups, activeDrivers] = await Promise.all([
      Delivery.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      ["administrator", "logistics"].includes(user.role) ? Driver.countDocuments({ status: { $ne: "Unavailable" } }) : Promise.resolve(0),
    ]);
    const counts = Object.fromEntries(groups.map(({ _id, count }) => [_id, count]));
    const totalDeliveries = groups.reduce((total, group) => total + group.count, 0);
    const inTransit = counts["In transit"] || 0;
    const delivered = counts.Delivered || 0;
    const delayed = counts.Delayed || 0;
    const pending = counts.Pending || 0;

    return {
      metrics: [
        {
          label: "Total deliveries",
          value: totalDeliveries.toLocaleString(),
          delta: "All recorded shipments",
          icon: "↗",
          tone: "mint",
        },
        {
          label: "In transit",
          value: inTransit.toLocaleString(),
          delta: `${activeDrivers} drivers active`,
          icon: "⇢",
          tone: "blue",
        },
        {
          label: "Delivered",
          value: delivered.toLocaleString(),
          delta: "Completed shipments",
          icon: "✓",
          tone: "purple",
        },
        {
          label: "Needs attention",
          value: delayed.toLocaleString(),
          delta: `${delayed} delayed orders`,
          icon: "!",
          tone: "orange",
        },
      ],
      counts: {
        total: totalDeliveries,
        pending,
        inTransit,
        delivered,
        delayed,
        activeDrivers,
        outForDelivery: counts["Out for delivery"] || 0,
        cancelled: counts.Cancelled || 0,
      },
    };
  }

  /**
   * Weekly shipment volume aggregated for the chart
   */
  async getWeeklyVolume(user = null) {
    const filter = await deliveryScope(user);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const aggregation = await Delivery.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sevenDaysAgo, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Build 7-day calendar array
    const volume = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const dayOfWeekIndex = d.getUTCDay() + 1; // MongoDB $dayOfWeek is 1-indexed (1=Sun)
      const dayLabel = dayNames[d.getUTCDay()];

      const match = aggregation.find((item) => item._id === dayOfWeekIndex);
      volume.push({
        day: dayLabel,
        count: match ? match.count : 0,
      });
    }

    return volume;
  }

  async getDeliveryTiming(user) {
    const filter = await deliveryScope(user);
    const [result] = await Delivery.aggregate([
      { $match: { ...filter, status: "Delivered" } },
      { $set: {
        measuredEnd: { $ifNull: ["$deliveredAt", { $max: { $map: { input: { $filter: { input: "$statusHistory", as: "event", cond: { $eq: ["$$event.status", "Delivered"] } } }, as: "event", in: "$$event.timestamp" } } }] },
        measuredStart: { $ifNull: ["$pickedUpAt", "$createdAt"] },
      } },
      { $match: { $expr: { $and: [
        { $eq: [{ $type: "$measuredEnd" }, "date"] },
        { $eq: [{ $type: "$measuredStart" }, "date"] },
        { $gte: ["$measuredEnd", "$measuredStart"] },
        { $lte: ["$measuredEnd", "$$NOW"] },
      ] } } },
      { $group: { _id: null, averageMs: { $avg: { $subtract: ["$measuredEnd", "$measuredStart"] } }, count: { $sum: 1 } } },
    ]);
    return { averageMinutes: result ? Math.round(result.averageMs / 60000) : null, measuredDeliveries: result?.count || 0 };
  }

  /**
   * Performance analytics overview
   */
  async getAnalyticsOverview(user = null) {
    const summary = await this.getDashboardSummary(user);
    const [volume, timings] = await Promise.all([this.getWeeklyVolume(user), this.getDeliveryTiming(user)]);

    return {
      summary: summary.counts,
      metrics: summary.metrics,
      weeklyVolume: volume,
      performance: {
        successRate: summary.counts.total ? `${(summary.counts.delivered / summary.counts.total * 100).toFixed(1)}%` : "0%",
        averageDeliveryTime: timings.averageMinutes === null ? null : `${Math.floor(timings.averageMinutes / 60)}h ${timings.averageMinutes % 60}m`,
        averageDeliveryTimeMinutes: timings.averageMinutes,
        measuredDeliveries: timings.measuredDeliveries,
        customerSatisfaction: null,
        totalRatings: 0,
      },
    };
  }
}

module.exports = new ReportService();

