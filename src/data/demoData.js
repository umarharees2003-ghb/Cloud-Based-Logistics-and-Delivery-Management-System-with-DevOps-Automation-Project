export const shipments = [
  { id: "SHP-10482", customer: "Miriam Patel", route: "Newark → Brooklyn", status: "In transit", eta: "14:30", city: "New York, NY" },
  { id: "SHP-10481", customer: "James Liu", route: "Jersey City → Queens", status: "Delayed", eta: "14:45", city: "Queens, NY" },
  { id: "SHP-10480", customer: "Olivia Martin", route: "Newark → Manhattan", status: "Delivered", eta: "13:12", city: "New York, NY" },
  { id: "SHP-10479", customer: "Ethan Brooks", route: "Elizabeth → Hoboken", status: "Out for delivery", eta: "15:10", city: "Hoboken, NJ" },
  { id: "SHP-10478", customer: "Sophia Chen", route: "Newark → Staten Island", status: "Pending", eta: "16:00", city: "Staten Island, NY" },
  { id: "SHP-10477", customer: "Noah Williams", route: "Newark → Manhattan", status: "In transit", eta: "14:38", city: "New York, NY" },
  { id: "SHP-10476", customer: "Ava Thompson", route: "Brooklyn → Manhattan", status: "Delivered", eta: "12:48", city: "New York, NY" },
  { id: "SHP-10475", customer: "Lucas Garcia", route: "Jersey City → Bronx", status: "Out for delivery", eta: "15:25", city: "Bronx, NY" },
];

export const shipmentVolume = [
  { day: "Wed", count: 42 },
  { day: "Thu", count: 58 },
  { day: "Fri", count: 51 },
  { day: "Sat", count: 31 },
  { day: "Sun", count: 26 },
  { day: "Mon", count: 57 },
  { day: "Tue", count: 72 },
];

export const userRoles = [
  { id: "administrator", label: "System Administrator", workspace: "Administration" },
  { id: "logistics", label: "Logistics Manager / Operations Staff", workspace: "Operations" },
  { id: "driver", label: "Delivery Driver / Courier", workspace: "Driver workspace" },
  { id: "customer", label: "Customer / Sender", workspace: "Customer portal" },
  { id: "merchant", label: "Business Client / Merchant", workspace: "Business account" },
];

export const sidebarGroups = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: "⌂" },
      { id: "deliveries", label: "Deliveries", icon: "▤", badge: "248" },
      { id: "fleet", label: "Fleet management", icon: "▰" },
      { id: "devops", label: "DevOps automation", icon: "⌘" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "analytics", label: "Analytics & reports", icon: "▥" },
      { id: "team", label: "Team & access", icon: "♙" },
      { id: "integrations", label: "Integrations", icon: "⌁" },
      { id: "settings", label: "Settings", icon: "⚙" },
    ],
  },
];

export const roleSidebarGroups = {
  administrator: sidebarGroups,
  logistics: [
    {
      label: "Operations",
      items: [
        { id: "overview", label: "Overview", icon: "⌂" },
        { id: "deliveries", label: "Deliveries", icon: "▤" },
        { id: "fleet", label: "Fleet management", icon: "▰" },
        { id: "analytics", label: "Analytics & reports", icon: "▥" },
      ],
    },
  ],
  driver: [
    {
      label: "My work",
      items: [
        { id: "overview", label: "My day", icon: "⌂" },
        { id: "deliveries", label: "My deliveries", icon: "▤" },
        { id: "driver-route", label: "Route plan", icon: "↗" },
      ],
    },
  ],
  customer: [
    {
      label: "My account",
      items: [
        { id: "customer-tracking", label: "Track a delivery", icon: "⌖" },
        { id: "customer-history", label: "Delivery history", icon: "▤" },
        { id: "customer-profile", label: "My profile", icon: "♙" },
      ],
    },
  ],
  merchant: [
    {
      label: "Business",
      items: [
        { id: "overview", label: "Store overview", icon: "⌂" },
        { id: "merchant-orders", label: "Shipments", icon: "▤" },
        { id: "analytics", label: "Reports", icon: "▥" },
        { id: "merchant-profile", label: "Business profile", icon: "♙" },
      ],
    },
  ],
};

export const initialOrders = [
  { id: "SHP-10482", customer: "Miriam Patel", route: "Newark → Brooklyn", status: "In transit", eta: "14:30", driver: "Alex Lee" },
  { id: "SHP-10481", customer: "James Liu", route: "Jersey City → Queens", status: "Delayed", eta: "14:45", driver: "Morgan Reed" },
  { id: "SHP-10480", customer: "Olivia Martin", route: "Newark → Manhattan", status: "Delivered", eta: "13:12", driver: "Sam Rivera" },
  { id: "SHP-10479", customer: "Ethan Brooks", route: "Elizabeth → Hoboken", status: "Out for delivery", eta: "15:10", driver: "Alex Lee" },
  { id: "SHP-10478", customer: "Sophia Chen", route: "Newark → Staten Island", status: "Pending", eta: "16:00", driver: "Unassigned" },
  { id: "SHP-10477", customer: "Noah Williams", route: "Newark → Manhattan", status: "In transit", eta: "14:38", driver: "Jamie Park" },
  { id: "SHP-10476", customer: "Ava Thompson", route: "Brooklyn → Manhattan", status: "Delivered", eta: "12:48", driver: "Sam Rivera" },
  { id: "SHP-10475", customer: "Lucas Garcia", route: "Jersey City → Bronx", status: "Out for delivery", eta: "15:25", driver: "Taylor Morgan" },
];

export const initialDrivers = [
  { name: "Alex Lee", initials: "AL", vehicle: "Van · V-204", zone: "Brooklyn", status: "On route", deliveries: 8 },
  { name: "Morgan Reed", initials: "MR", vehicle: "Van · V-118", zone: "Queens", status: "On route", deliveries: 6 },
  { name: "Sam Rivera", initials: "SR", vehicle: "Truck · T-032", zone: "Manhattan", status: "Available", deliveries: 0 },
  { name: "Jamie Park", initials: "JP", vehicle: "Van · V-081", zone: "Newark", status: "On route", deliveries: 5 },
];

export const overviewMetrics = [
  { label: "Total deliveries", value: "1,284", delta: "+12.8%", icon: "↗", tone: "mint" },
  { label: "In transit", value: "342", delta: "28 drivers active", icon: "⇢", tone: "blue" },
  { label: "Delivered today", value: "876", delta: "96.8% on time", icon: "✓", tone: "purple" },
  { label: "Needs attention", value: "12", delta: "4 delayed orders", icon: "!", tone: "orange" },
];

export const welcomeFeatures = [
  {
    icon: "⌖",
    title: "See every delivery",
    description: "Track orders and route progress from dispatch to the final stop.",
  },
  {
    icon: "↗",
    title: "Plan smarter routes",
    description: "Give your team the context to adapt quickly when plans change.",
  },
  {
    icon: "◎",
    title: "Keep teams in sync",
    description: "Bring drivers, dispatchers, and customer updates into one view.",
  },
];

export const rolePhotoCollections = {
  administrator: {
    heading: "Your logistics network",
    description: "A visual overview of the vehicles and facilities in your operation.",
    photos: [
      {
        image: "/images/role-fleet.jpg",
        alt: "Freight trucks travelling together on a delivery route",
        title: "Fleet overview",
        detail: "Vehicles moving across the network",
      },
      {
        image: "/images/delivery-hub.jpg",
        alt: "Distribution warehouse prepared for parcel dispatch",
        title: "Distribution hubs",
        detail: "Facilities supporting daily operations",
      },
      {
        image: "/images/role-operations.jpg",
        alt: "Courier loading parcels into a delivery van",
        title: "Last-mile operations",
        detail: "Deliveries from pickup to doorstep",
      },
    ],
  },
  logistics: {
    heading: "Today’s operations",
    description: "See the vehicles, people, and facilities behind each delivery.",
    photos: [
      {
        image: "/images/delivery-hub.jpg",
        alt: "Warehouse team preparing parcels for delivery",
        title: "Warehouse dispatch",
        detail: "Orders ready for their next route",
      },
      {
        image: "/images/role-operations.jpg",
        alt: "Courier loading packages into a delivery van",
        title: "Driver handoff",
        detail: "Parcels moving from hub to route",
      },
      {
        image: "/images/role-fleet.jpg",
        alt: "Line of freight trucks on a logistics route",
        title: "Active fleet",
        detail: "Vehicles covering delivery zones",
      },
    ],
  },
  driver: {
    heading: "Out on the road",
    description: "A quick look at your vehicle, parcel pickups, and delivery route.",
    photos: [
      {
        image: "/images/freight-truck.jpg",
        alt: "Freight truck travelling along a country road",
        title: "Your route",
        detail: "Keep your next stop in view",
      },
      {
        image: "/images/role-driver.jpg",
        alt: "Courier handing over a parcel at a delivery van",
        title: "Parcel handoff",
        detail: "Confirm each collection and delivery",
      },
      {
        image: "/images/role-fleet.jpg",
        alt: "Freight trucks travelling through a delivery region",
        title: "On the move",
        detail: "Your workday, stop by stop",
      },
    ],
  },
  customer: {
    heading: "Your delivery, every step",
    description: "From a parcel being prepared to its final handoff.",
    photos: [
      {
        image: "/images/role-merchant.jpg",
        alt: "Merchant carefully sealing a parcel for shipping",
        title: "Getting ready",
        detail: "Your parcel is packed for pickup",
      },
      {
        image: "/images/role-customer.jpg",
        alt: "Customer receiving a parcel from a courier",
        title: "On its way",
        detail: "Follow your delivery as it moves",
      },
      {
        image: "/images/role-operations.jpg",
        alt: "Courier loading parcels into a delivery van",
        title: "Final delivery",
        detail: "The last stop is almost here",
      },
    ],
  },
  merchant: {
    heading: "From your store to your customers",
    description: "Follow the shipping journey from packing bench to delivery route.",
    photos: [
      {
        image: "/images/role-merchant.jpg",
        alt: "Merchant preparing a packaged order for shipping",
        title: "Pack an order",
        detail: "Prepare customer orders for pickup",
      },
      {
        image: "/images/delivery-hub.jpg",
        alt: "Distribution center sorting outbound parcels",
        title: "Dispatch and sort",
        detail: "Keep outgoing shipments together",
      },
      {
        image: "/images/role-driver.jpg",
        alt: "Courier accepting a package for delivery",
        title: "Delivery handoff",
        detail: "Shipments headed to your customers",
      },
    ],
  },
};

export const secondarySectionsContent = {
  devops: {
    title: "DevOps automation",
    description: "Monitor the health of your delivery platform and deployment pipeline.",
    cards: [
      ["CI pipeline", "All checks passing", "Last run 8 minutes ago"],
      ["Deployment", "Production is up to date", "Release v1.8.2"],
      ["Application health", "Healthy", "99.98% uptime this month"],
      ["Monitoring", "Active", "Logs and alerts are connected"],
    ],
  },
  team: {
    title: "Team & access",
    description: "Manage the people who keep your deliveries moving.",
    cards: [
      ["Operations team", "12 members", "Dispatch and support"],
      ["Drivers", "4 active profiles", "Manage from Fleet management"],
      ["Administrator", "Demo account", "Full workspace access"],
      ["Access policy", "Role-based access", "Permissions are configurable"],
    ],
  },
  integrations: {
    title: "Integrations",
    description: "Connect the tools your logistics operation relies on.",
    cards: [
      ["Maps & routing", "Connected", "Route optimization enabled"],
      ["Email notifications", "Connected", "Delivery updates enabled"],
      ["Cloud storage", "Ready to connect", "Store proof of delivery"],
      ["API access", "Available", "Manage keys in settings"],
    ],
  },
  settings: {
    title: "Workspace settings",
    description: "Configure your Routeflow workspace preferences.",
    cards: [
      ["Organization", "Routeflow Logistics", "Company profile and service area"],
      ["Notifications", "Email and in-app", "Choose which events to receive"],
      ["Security", "Two-step verification", "Protect administrator accounts"],
      ["Preferences", "America / New York", "Time zone and display options"],
    ],
  },
};
