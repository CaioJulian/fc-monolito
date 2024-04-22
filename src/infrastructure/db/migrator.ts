import { Sequelize } from "sequelize-typescript";
import { SequelizeStorage, Umzug } from "umzug";
import { join } from "path";

export const migrator = (sequelize: Sequelize) => {
  return new Umzug({
    migrations: {
      glob: [
        "*/infrastructure/db/migrations/*.{js,ts}",
        {
          cwd: join(__dirname, "../../../"),
          ignore: ["**/*.d.ts", "**/index.ts", "**/index.js"],
        },
      ],
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
};
