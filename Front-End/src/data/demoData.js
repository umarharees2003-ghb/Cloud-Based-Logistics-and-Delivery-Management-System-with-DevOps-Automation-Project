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

// Licensed illustrative photography. Credits and source URLs: IMAGE_LICENSES.md.
const logisticsPhotos = {
  truck: {
    image: "/images/logistics-truck.webp",
    srcSet: "/images/logistics-truck-800.webp 800w, /images/logistics-truck.webp 1400w",
    alt: "A white freight truck and trailer traveling on a highway at sunset",
  },
  warehouse: {
    image: "/images/logistics-warehouse.webp",
    srcSet: "/images/logistics-warehouse-800.webp 800w, /images/logistics-warehouse.webp 1400w",
    alt: "Distribution warehouse with shelves of parcels and yellow storage bins",
  },
  port: {
    image: "/images/logistics-port.webp",
    srcSet: "/images/logistics-port-800.webp 800w, /images/logistics-port.webp 1400w",
    alt: "Aerial view of colorful shipping containers and transport lanes at a port",
  },
};

export const rolePhotoCollections = {
  administrator: {
    heading: "Your logistics network",
    description: "The people, transport links, and facilities behind every delivery.",
    photos: [
      { ...logisticsPhotos.truck, title: "Fleet overview", detail: "Vehicles connecting the network" },
      { ...logisticsPhotos.warehouse, title: "Distribution hubs", detail: "Facilities supporting daily operations" },
      { ...logisticsPhotos.port, title: "Network handoffs", detail: "Connections between transport routes" },
    ],
  },
  logistics: {
    heading: "Today’s operations",
    description: "A closer look at the journey from dispatch to delivery.",
    photos: [
      { ...logisticsPhotos.warehouse, title: "Warehouse dispatch", detail: "Prepare orders for their next route" },
      { ...logisticsPhotos.port, title: "Container coordination", detail: "Handoffs between transport networks" },
      { ...logisticsPhotos.truck, title: "Active fleet", detail: "Vehicles connecting delivery regions" },
    ],
  },
  driver: {
    heading: "Out on the road",
    description: "Keep your next pickup, vehicle, and delivery route in focus.",
    photos: [
      { ...logisticsPhotos.truck, title: "Your route", detail: "Keep your next stop in view" },
      { ...logisticsPhotos.warehouse, title: "Pickup preparation", detail: "Parcels ready for the next handoff" },
      { ...logisticsPhotos.port, title: "Connected transport", detail: "The network behind every delivery" },
    ],
  },
  customer: {
    heading: "Your delivery, every step",
    description: "Follow your parcel from preparation to its final destination.",
    photos: [
      { ...logisticsPhotos.warehouse, title: "Getting ready", detail: "Orders prepared for dispatch" },
      { ...logisticsPhotos.truck, title: "On its way", detail: "Follow your delivery as it moves" },
      { ...logisticsPhotos.port, title: "Connected journey", detail: "Every handoff brings it closer" },
    ],
  },
  merchant: {
    heading: "From your store to your customers",
    description: "Follow the shipping journey from preparation to delivery route.",
    photos: [
      { ...logisticsPhotos.warehouse, title: "Ready for dispatch", detail: "Keep outgoing orders together" },
      { ...logisticsPhotos.port, title: "Connected distribution", detail: "Handoffs across the shipping network" },
      { ...logisticsPhotos.truck, title: "On the road", detail: "Shipments headed to your customers" },
    ],
  },
};
