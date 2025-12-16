import Settings from "../models/settings.model.js";

export const getSettings = async (_req, res) => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  res.json({ success: true, settings: s });
};

export const updateSettings = async (req, res) => {
  const { defaultDurationHours, maintenanceMinutes } = req.body;

  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});

  if (defaultDurationHours != null) s.defaultDurationHours = Number(defaultDurationHours);
  if (maintenanceMinutes != null) s.maintenanceMinutes = Number(maintenanceMinutes);

  await s.save();
  res.json({ success: true, message: "Settings updated", settings: s });
};
