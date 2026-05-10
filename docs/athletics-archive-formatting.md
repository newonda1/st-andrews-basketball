# Athletics Archive Formatting

For St. Andrew's athletics archive pages, the 2003-04 school-year season pages are the formatting standard for all seasons before the 2015 school year.

When editing pre-2015 season pages:

- Put the season recap at the top of the page.
- Keep season brief cards embedded at the top right of the recap on desktop, with recap text flowing around them.
- Keep schedule/opponent logos compact so schedule rows stay comparable in height to roster and stat rows.
- Link roster and stat-table athlete names to the shared athlete profile at `/athletics/players/:playerId`.
- Pass a sport hint in shared athlete links, such as `?sport=boys-basketball`, so the profile opens on the sport the user clicked from.

The helper in `src/athletes/archiveEra.js` encodes the current pre-2015 cutoff and shared profile-link behavior.
