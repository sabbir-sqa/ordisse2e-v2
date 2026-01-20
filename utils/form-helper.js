// utils/form-helper.js
exports.setChecked = async (checkbox, shouldBeChecked) => {
  const isChecked = await checkbox.isChecked();
  if (isChecked !== shouldBeChecked) {
    await checkbox.click();
  }
};
