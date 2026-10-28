-- seed-v2.sql — the Swaad opening data: six fictional healthy-eating
-- restaurants in Bangalore. Wrap Sabha (id 6) has no reviews on purpose,
-- so the empty state can be seen for real.

INSERT INTO restaurants (name, cuisine, area) VALUES
  ('Sprout & Story', 'Salad bowls', 'Indiranagar, Bangalore'),
  ('Press & Pour', 'Cold-pressed juices & smoothies', 'Koramangala, Bangalore'),
  ('Ragi House', 'Millet & South Indian healthy meals', 'HSR Layout, Bangalore'),
  ('The Grain Project', 'Grain & protein bowls', 'Whitefield, Bangalore'),
  ('The Verdant Table', 'Vegan cafe', 'Jayanagar, Bangalore'),
  ('Wrap Sabha', 'Healthy wraps', 'JP Nagar, Bangalore');

INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
  -- Sprout & Story (id 1)
  (1, 5, 'The watermelon feta salad is a whole personality. Coming back Friday.', NOW() - INTERVAL '5 days'),
  (1, 4, 'Fresh, filling, and the peanut dressing is dangerous. Portions could be bigger.', NOW() - INTERVAL '3 days'),
  (1, 5, 'Finally a salad that does not taste like punishment.', NOW() - INTERVAL '2 days'),
  (1, 4, 'Good, but the weekend queue is a test of character.', NOW() - INTERVAL '1 day'),
  -- Press & Pour (id 2)
  (2, 5, 'Post-gym smoothie heaven. The beetroot ginger juice actually works.', NOW() - INTERVAL '6 days'),
  (2, 4, 'Juices are great; wish they had more seating.', NOW() - INTERVAL '4 days'),
  (2, 3, 'Tasty, but pricey for the quantity.', NOW() - INTERVAL '1 day'),
  -- Ragi House (id 3)
  (3, 5, 'The ragi mudde with bassaru tasted like my grandmother''s, but lighter.', NOW() - INTERVAL '7 days'),
  (3, 4, 'Millet pongal and filter coffee for the win. Quick service too.', NOW() - INTERVAL '5 days'),
  (3, 5, 'Finally healthy South Indian that does not compromise on taste.', NOW() - INTERVAL '3 days'),
  (3, 4, 'Parking is a pain, but the ragi dosa is worth it.', NOW() - INTERVAL '1 day'),
  -- The Grain Project (id 4)
  (4, 4, 'Quinoa bowl with paneer kept me full till dinner. My office-lunch staple now.', NOW() - INTERVAL '4 days'),
  (4, 5, 'High protein without tasting like chalk. Rare.', NOW() - INTERVAL '2 days'),
  -- The Verdant Table (id 5)
  (5, 5, 'The jackfruit biryani converted my meat-loving dad. A miracle.', NOW() - INTERVAL '6 days'),
  (5, 4, 'Vegan desserts that are actually good. The chocolate tart, wow.', NOW() - INTERVAL '3 days'),
  (5, 4, 'Peaceful space, kind staff, great filter coffee with almond milk.', NOW() - INTERVAL '2 days');
  -- Wrap Sabha (id 6): no reviews by design.
