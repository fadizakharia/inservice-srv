export type customerActions = "cancel" | "fulfill" | "unfulfill";
export type providerActions = "accept" | "cancel" | "reject";

export const getAvailableActions = (
  customerCurrentAction: string,
  providerCurrentAction: string
) => {
  const availableAction = availableActions.filter((value) => {
    if (
      value.customer === customerCurrentAction &&
      value.provider === providerCurrentAction
    ) {
      return true;
    } else {
      return false;
    }
  });
  return availableAction[0];
};

export const validateAction = (
  customerCurrentAction: string,
  providerCurrentAction: string,
  type: "customer" | "provider",
  nextAction: customerActions | providerActions
) => {
  let isAllowed = false;
  const availableAction = availableActions.filter((value) => {
    if (
      value.customer === customerCurrentAction &&
      value.provider === providerCurrentAction
    ) {
      return true;
    } else {
      return false;
    }
  });

  if (type === "customer") {
    isAllowed = availableAction[0].nextActionsCustomer.includes(nextAction);
  } else {
    isAllowed = availableAction[0].nextActionsProvider.includes(nextAction);
  }
  return isAllowed;
};
export const availableActions = [
  {
    customer: "cancel",
    provider: "accepted",
    result: "canceled event",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
  {
    customer: "requested",
    provider: "no-action",
    result: "pending approval",
    nextActionsCustomer: ["cancel"],
    nextActionsProvider: ["accept", "reject"],
    archived: false,
  },
  {
    customer: "requested",
    provider: "reject",
    result: "request rejected",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
  {
    customer: "requested",
    provider: "accepted",
    result: "active",
    nextActionsCustomer: ["cancel"],
    nextActionsProvider: ["cancel"],
    archived: false,
  },
  {
    customer: "fulfilled",
    provider: "accepted",
    result: "fulfilled",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
  {
    customer: "unfulfilled",
    provider: "accepted",
    result: "unfulfilled",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
  {
    customer: "requested",
    provider: "cancel",
    result: "canceled",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
  {
    customer: "cancel",
    provider: "no-action",
    result: "canceled request",
    nextActionsCustomer: [],
    nextActionsProvider: [],
    archived: true,
  },
];
