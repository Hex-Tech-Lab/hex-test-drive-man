-- Populate missing categories if not present
insert into categories (name)
select * from (values ('SUV'), ('Hatchback'), ('Coupe'), ('Convertible'), ('Wagon'), ('Pickup')) as v(name)
where not exists (select 1 from categories c where c.name = v.name);
