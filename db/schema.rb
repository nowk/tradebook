# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2024_02_20_214057) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "seed_migration_data_migrations", id: :serial, force: :cascade do |t|
    t.string "version"
    t.integer "runtime"
    t.datetime "migrated_on"
  end

  create_table "trades", force: :cascade do |t|
    t.string "symbol"
    t.string "type"
    t.integer "quantity_filled"
    t.decimal "filled_price", precision: 15, scale: 8
    t.decimal "commission", precision: 15, scale: 8
    t.datetime "filled_at"
    t.string "order_no"
    t.string "gid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
