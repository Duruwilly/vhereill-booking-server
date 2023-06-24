export const roles = {
  support: {
    permissions: ["view-transactions", "view-profile", "view-users"],
  },
  frontDesk: {
    permissions: ["view-bookings", "view-profile"],
  },
  admin: {
    permissions: [
      "view-transactions",
      "create-users",
      "view-users",
      "view-transactions",
      "view-hotels",
      "view-bookings"
    ],
  },
};
