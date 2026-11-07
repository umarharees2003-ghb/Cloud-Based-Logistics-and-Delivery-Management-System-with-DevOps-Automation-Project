const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const Delivery = require("../src/models/Delivery");
const logger = require("../src/config/logger");

const SEED_USERS = [
  {
    name: "System Administrator",
    email: "admin@routeflow.io",
    password: "AdminRouteflow2026!",
    role: "administrator",
    phone: "+1-555-0100",
  },
  {
    name: "Logistics Manager",
    email: "logistics@routeflow.io",
    password: "LogisticsRouteflow2026!",
    role: "logistics",
    phone: "+1-555-0101",
  },
  {
    name: "Alex Lee",
    email: "driver@routeflow.io",
    password: "DriverRouteflow2026!",
    role: "driver",
    phone: "+1-555-0102",
  },
  {
    name: "Jordan Smith",
    email: "customer@routeflow.io",
    password: "CustomerRouteflow2026!",
    role: "customer",
    phone: "+1-555-0103",
  },
  {
    name: "Metro Retailers",
    email: "merchant@routeflow.io",
    password: "MerchantRouteflow2026!",
    role: "merchant",
    company: "Metro Retailers Inc.",
    phone: "+1-555-0104",
  },
];

const SEED_DRIVERS = [
  {
    name: "Alex Lee",
    initials: "AL",
    vehicle: "Van · V-204",
    zone: "Brooklyn",
    status: "On route",
    deliveries: 8,
  },
  {
    name: "Morgan Reed",
    initials: "MR",
    vehicle: "Van · V-118",
    zone: "Queens",
    status: "On route",
    deliveries: 6,
  },
  {
    name: "Sam Rivera",
    initials: "SR",
    vehicle: "Truck · T-032",
    zone: "Manhattan",
    status: "Available",
    deliveries: 0,
  },
  {
    name: "Jamie Park",
    initials: "JP",
    vehicle: "Van · V-081",
    zone: "Newark",
    status: "On route",
    deliveries: 5,
  },
];

const SEED_SHIPMENTS = [
  {
    deliveryId: "SHP-10482",
    customer: "Miriam Patel",
    pickup: "Newark",
    dropoff: "Brooklyn",
    route: "Newark → Brooklyn",
    status: "In transit",
    eta: "14:30",
    driverName: "Alex Lee",
    city: "New York, NY",
  },
  {
    deliveryId: "SHP-10481",
    customer: "James Liu",
    pickup: "Jersey City",
    dropoff: "Queens",
    route: "Jersey City → Queens",
    status: "Delayed",
    eta: "14:45",
    driverName: "Morgan Reed",
    city: "Queens, NY",
  },
  {
    deliveryId: "SHP-10480",
    customer: "Olivia Martin",
    pickup: "Newark",
    dropoff: "Manhattan",
    route: "Newark → Manhattan",
    status: "Delivered",
    eta: "13:12",
    driverName: "Sam Rivera",
    city: "New York, NY",
  },
  {
    deliveryId: "SHP-10479",
    customer: "Ethan Brooks",
    pickup: "Elizabeth",
    dropoff: "Hoboken",
    route: "Elizabeth → Hoboken",
    status: "Out for delivery",
    eta: "15:10",
    driverName: "Alex Lee",
    city: "Hoboken, NJ",
  },
  {
    deliveryId: "SHP-10478",
    customer: "Sophia Chen",
    pickup: "Newark",
    dropoff: "Staten Island",
    route: "Newark → Staten Island",
    status: "Pending",
    eta: "16:00",
    driverName: "Unassigned",
    city: "Staten Island, NY",
  },
  {
    deliveryId: "SHP-10477",
    customer: "Noah Williams",
    pickup: "Newark",
    dropoff: "Manhattan",
    route: "Newark → Manhattan",
    status: "In transit",
    eta: "14:38",
    driverName: "Jamie Park",
    city: "New York, NY",
  },
  {
    deliveryId: "SHP-10476",
    customer: "Ava Thompson",
    pickup: "Brooklyn",
    dropoff: "Manhattan",
    route: "Brooklyn → Manhattan",
    status: "Delivered",
    eta: "12:48",
    driverName: "Sam Rivera",
    city: "New York, NY",
  },
  {
    deliveryId: "SHP-10475",
    customer: "Lucas Garcia",
    pickup: "Jersey City",
    dropoff: "Bronx",
    route: "Jersey City → Bronx",
    status: "Out for delivery",
    eta: "15:25",
    driverName: "Alex Lee",
    city: "Bronx, NY",
  },
];

async function seed() {
  try {
    await connectDatabase();
    logger.info("Starting Routeflow database seed process...");

    // 1. Seed Users
    const userMap = {};
    for (const userData of SEED_USERS) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        logger.info("Created user: %s (%s)", user.name, user.role);
      } else {
        logger.info("User already exists: %s", user.email);
      }
      userMap[userData.name] = user;
    }

    // 2. Seed Drivers
    const driverMap = {};
    for (const driverData of SEED_DRIVERS) {
      let driver = await Driver.findOne({ name: driverData.name });
      if (!driver) {
        // Link to existing user or create linked driver user
        let linkedUser = userMap[driverData.name];
        if (!linkedUser) {
          const email = `${driverData.name.toLowerCase().replace(/\s+/g, ".")}@routeflow.io`;
          linkedUser = await User.findOne({ email });
          if (!linkedUser) {
            linkedUser = await User.create({
              name: driverData.name,
              email,
              password: "DriverPass2026!",
              role: "driver",
            });
          }
        }

        driver = await Driver.create({
          user: linkedUser._id,
          ...driverData,
        });
        logger.info("Created driver: %s (%s)", driver.name, driver.vehicle);
      } else {
        logger.info("Driver already exists: %s", driver.name);
      }
      driverMap[driver.name] = driver;
    }

    // 3. Seed Deliveries
    for (let i = 0; i < SEED_SHIPMENTS.length; i++) {
      const ship = SEED_SHIPMENTS[i];
      let delivery = await Delivery.findOne({ deliveryId: ship.deliveryId });
      if (!delivery) {
        const assignedDriver = driverMap[ship.driverName];
        delivery = await Delivery.create({
          deliveryId: ship.deliveryId,
          trackingNumber: `RF-TRK-${90000 + i}`,
          customer: ship.customer,
          pickup: ship.pickup,
          dropoff: ship.dropoff,
          route: ship.route,
          status: ship.status,
          eta: ship.eta,
          city: ship.city,
          driverName: ship.driverName,
          assignedDriver: assignedDriver ? assignedDriver._id : null,
          statusHistory: [
            {
              status: "Pending",
              changedByName: "System",
              timestamp: new Date(Date.now() - 3600000 * 5),
              remarks: "Initial dispatch",
            },
            {
              status: ship.status,
              changedByName: "System",
              timestamp: new Date(),
              remarks: `Current status: ${ship.status}`,
            },
          ],
        });
        logger.info("Created delivery: %s (%s)", delivery.deliveryId, delivery.route);
      } else {
        logger.info("Delivery already exists: %s", delivery.deliveryId);
      }
    }

    logger.info("Database seeding completed successfully!");
  } catch (error) {
    logger.error("Seeding error: %s", error.stack);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;

