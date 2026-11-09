describe("Routeflow Logistics End-to-End Suite", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("loads the welcome landing page with brand and platform navigation", () => {
    cy.contains("routeflow");
    cy.contains("Make every mile");
    cy.get("button").contains("Sign in").should("be.visible");
    cy.get("button").contains("Sign up").should("be.visible");
  });

  it("navigates to the auth screen and logs in as Administrator", () => {
    cy.get("button").contains("Sign in").click();
    cy.contains("Welcome back");
    cy.get("select[name='roleId']").should("be.visible");
    cy.get("select[name='roleId']").select("administrator");
    cy.get("input[name='email']").type("admin@routeflow.io");
    cy.get("input[name='password']").type("AdminRouteflow2026!");
    cy.get("button[type='submit']").click();

    // Verify platform workspace loads
    cy.contains("Routeflow Logistics");
    cy.contains("Demo workspace for System Administrator");
  });

  it("switches between workspace views: Deliveries and Fleet", () => {
    cy.get("button").contains("Sign in").click();
    cy.get("select[name='roleId']").select("administrator");
    cy.get("input[name='email']").type("admin@routeflow.io");
    cy.get("input[name='password']").type("AdminRouteflow2026!");
    cy.get("button[type='submit']").click();

    // Navigate to Deliveries
    cy.get("button").contains("Deliveries").click();
    cy.contains("All deliveries");
    cy.get(".orders-table").should("be.visible");

    // Navigate to Fleet Management
    cy.get("button").contains("Fleet management").click();
    cy.contains("Driver roster");
  });
});

