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
        { id: "driver-profile", label: "My profile", icon: "U" },
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
