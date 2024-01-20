require "active_record"
require "standalone_migrations"
require "seed_migration"

# Fixes LoadError: cannot load such file -- seed_migration/data_migration.
# NOTE we are not using a standard Rails app and must have some directories
# available to us by hand
gem_dir = Gem::Specification.find_by_name("seed_migration").gem_dir
$LOAD_PATH.unshift File.expand_path("#{gem_dir}/app/models", __FILE__)

ActiveRecord::Tasks::DatabaseTasks::LOCAL_HOSTS << "postgres"
StandaloneMigrations::Tasks.load_tasks