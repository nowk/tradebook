class CreateTradesTable < ActiveRecord::Migration[5.2]
  def change
    create_table :trades do |t|
      t.string :symbol
      t.string :type
      t.string :side

      t.string :cusip
      
      # NOTE financial numbers need to be done as a positive integer to avoid
      # float / decimal precision issues
      t.bigint :price
      t.bigint :commission

      # this is the decimal multiplier to get round price to a positive integer
      t.integer :dm, default: 100 # USD 2 decimals

      t.integer :quantity

      t.datetime :filled_at

      t.json :raw

      t.timestamps
    end
  end
end
