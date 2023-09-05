const mapDBToModel = ({ created_at, updated_at, ...args }) => ({
  ...args,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToModel };
