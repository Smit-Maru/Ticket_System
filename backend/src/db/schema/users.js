import {
  pgTable,
  serial,
  varchar,
  text
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userid: serial("userid").primaryKey(),

  name: varchar("name", {
    length: 100
  }).notNull(),

  email: varchar("email", {
    length: 255
  }).notNull(),

  passwordhash: text("passwordhash").notNull(),

  role: varchar("role", {
    length: 20
  }).notNull()
});
