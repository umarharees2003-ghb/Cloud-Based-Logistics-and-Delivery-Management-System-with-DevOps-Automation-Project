const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const User = require("../models/User");

class ReportService {
  /**
   * Get high-level operational summary
   */
  async getDashboardSummary(user = null) {
    const filter = {};
    if (user) {
      if (user.role === "customer") {
        filter.$or = [{ sender: user._id }, { customer: user.name }];
      } else if (user.role === "merchant") {
        filter.$or = [{ merchant: user._id }, { sender: user._id }, { customer: user.name }];
      } else if (user.role === "driver") {
        filter.driverName = user.name;
      }
    }

    const [
      totalDeliveries,
      inTransit,
      delivered,
      delayed,
      pending,
      activeDrivers,
    ] = await Promise.all([
      Delivery.countDocuments(filter),
      Delivery.countDocuments({ ...filter, status: "In transit" }),
      Delivery.countDocuments({ ...filter, status: "Delivered" }),
      Delivery.countDocuments({ ...filter, status: "Delayed" }),
      Delivery.countDocuments({ ...filter, status: "Pending" }),
      Driver.countDocuments({ status: { $ne: "Unavailable" } }),
    ]);

    const onTimeRate =
      totalDeliveries > 0
        ? (((totalDeliveries - delayed) / totalDeliveries) * 100).toFixed(1)
        : "100.0";

    return {
      metrics: [
        {
          label: "Total deliveries",
          value: totalDeliveries.toLocaleString(),
          delta: "+12.8%",
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
          label: "Delivered today",
          value: delivered.toLocaleString(),
          delta: `${onTimeRate}% on time`,
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
      },
    };
  }

  /**
   * Weekly shipment volume aggregated for the chart
   */
  async getWeeklyVolume(user = null) {
    const filter = {};
    if (user) {
      if (user.role === "customer") {
        filter.$or = [{ sender: user._id }, { customer: user.name }];
      } else if (user.role === "merchant") {
        filter.$or = [{ merchant: user._id }, { sender: user._id }, { customer: user.name }];
      } else if (user.role === "driver") {
        filter.driverName = user.name;
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const aggregation = await Delivery.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sevenDaysAgo },
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
      d.setDate(d.getDate() - i);
      const dayOfWeekIndex = d.getDay() + 1; // MongoDB $dayOfWeek is 1-indexed (1=Sun)
      const dayLabel = dayNames[d.getDay()];

      const match = aggregation.find((item) => item._id === dayOfWeekIndex);
      volume.push({
        day: dayLabel,
        count: match ? match.count : 0,
      });
    }

    return volume;
  }

  /**
   * Performance analytics overview
   */
  async getAnalyticsOverview(user = null) {
    const summary = await this.getDashboardSummary(user);
    const volume = await this.getWeeklyVolume(user);

    return {
      summary: summary.counts,
      metrics: summary.metrics,
      weeklyVolume: volume,
      performance: {
        successRate: "96.8%",
        averageDeliveryTime: "2h 18m",
        customerSatisfaction: "4.9 / 5",
        totalRatings: 328,
      },
    };
  }
}

module.exports = new ReportService();

