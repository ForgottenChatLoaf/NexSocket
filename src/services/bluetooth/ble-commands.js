/**
 * Hardware Command Protocol Definitions
 */
export const BLE_COMMANDS = {
  OUTLET_1_ON: 0x01,
  OUTLET_1_OFF: 0x02,
  OUTLET_2_ON: 0x03,
  OUTLET_2_OFF: 0x04,
  ALL_OFF: 0x05,
};

export const BLE_COMMAND_DESCRIPTIONS = {
  [BLE_COMMANDS.OUTLET_1_ON]: 'Turn Outlet 1 ON',
  [BLE_COMMANDS.OUTLET_1_OFF]: 'Turn Outlet 1 OFF',
  [BLE_COMMANDS.OUTLET_2_ON]: 'Turn Outlet 2 ON',
  [BLE_COMMANDS.OUTLET_2_OFF]: 'Turn Outlet 2 OFF',
  [BLE_COMMANDS.ALL_OFF]: 'Turn All Outlets OFF',
};
