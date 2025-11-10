export const mongooseDateTransform = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB");
}