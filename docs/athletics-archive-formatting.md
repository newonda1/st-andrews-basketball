# Athletics Archive Formatting

For St. Andrew's athletics archive pages, the 2003-04 school-year season pages are the formatting standard for all seasons before the 2015 school year.

The active prototype for season-page spacing is the 2003-04 boys basketball season page, and each sport's 2003-04/2005-06 pages should mirror that same visual rhythm: same section order, same heading sizes, same compact table padding, same non-bold roster names, same compact logos, and bold green/red/gray schedule result values. When creating a new data-light season shell, render every expected section with placeholders instead of omitting sections so the user can fill data without rechecking typography or table spacing.

When editing pre-2015 season pages:

- Use this section order where the sport supports it: Season Recap, Season Images, Roster, Schedule & Results, then sport-specific brackets or stat sections.
- Put the season recap at the top of the page.
- Keep season brief cards embedded at the top right of the recap on desktop, with recap text flowing around them.
- Keep schedule/opponent logos compact so schedule rows stay comparable in height to roster and stat rows.
- Align the Schedule & Results Opponent header with the opponent names, accounting for the compact logo slot before each name.
- Link roster and stat-table athlete names to the shared athlete profile at `/athletics/players/:playerId`.
- Pass a sport hint in shared athlete links, such as `?sport=boys-basketball`, so the profile opens on the sport the user clicked from.
- Leave placeholder sections for missing season recaps or season images instead of omitting those sections, then report the missing content for follow-up.
- Unknown schedule placeholders should use descriptive date labels such as `Between November 2 and November 12` or `Before August 30`. Unknown opponents should display as `Unknown` on schedule pages, should not appear in Records vs. Opponents pages, and all other unknown schedule fields should render as `-`.

The helper in `src/athletes/archiveEra.js` encodes the current pre-2015 cutoff and shared profile-link behavior.
