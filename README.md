# Easy Floorplan

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![license][license-badge]](LICENSE)

<a href="https://www.buymeacoffee.com/nicosandller" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important; width: 217px !important;" >
</a>

A Home Assistant Lovelace card for building an interactive floorplan — **with a visual
drag-and-drop editor**. Draw walls, drop doors and windows, add furniture and labels, and
place your entities as icons, ripples or live state. Everything scales to the card and
screen size.


<img width="1080" height="608" alt="demo" src="https://github.com/user-attachments/assets/98abaddc-b713-492f-be85-ca5f778f3779" />

## What you can end up with

<img width="1161" height="596" alt="Screenshot 2026-08-06 at 4 26 22 PM" src="https://github.com/user-attachments/assets/69c6c865-4eeb-4878-914b-182b2c31b63b" />

## Features
- **Visual editor** — draw walls, drop doors and windows that snap onto them, drag, nudge with arrow keys, multi-select, copy/paste, undo/redo, zoom.
  - 🆕 **Lock in place** — pin anything you have finished positioning. A locked element still selects and edits but never moves, and it yields the click to whatever is unlocked on top of it, so reaching for a window stops grabbing the wall behind it. See [Locking elements in place](#locking-elements-in-place).
  - **Apply** — save the plan to the dashboard *without* closing the editor, so you can judge a change on the real card (in a second tab, or by collapsing the editor) instead of in the small preview beside it, then carry straight on. Needs Home Assistant 2025.3 or newer; on anything older the button says so and Save still works.
- **Devices** — bind any entity to an icon: tap to toggle or open more-info, live state or attribute label, custom icon, size, rotation.
  - **Presence ripples** — presence and vibration sensors drawn as animated rings instead of a static icon.
  - **Cast light** — a light pools its own color and brightness onto the plan; overlapping pools mix, so a warm lamp and a cool one blend between them.
  - **Conditional text / icon / coloring** — threshold and state rules restyle an element from what its entity reads: the badge color, the label, and the glyph itself, so blinds swap between open and closed icons and a thermostat reddens as it heats. The same rules drive furniture and rooms.
 
<img width="195" height="278" alt="light blend" src="https://github.com/user-attachments/assets/23104587-687b-4c9a-83e8-e83c3d5eb6eb" />
<img width="240" height="358" alt="conditionals" src="https://github.com/user-attachments/assets/11d359b6-de8c-483c-8763-105ddf7d915b" />

- **Many readings, one device** — a sensor that reports temperature, humidity and pressure needs one badge, not three. Add entities one at a time; they show whether or not the device's own state does, so a smart plug can label itself `1.2 kW · 84 · 5 min ago` while the badge colour carries the on/off. The label can sit below, left or right of the badge.
- **Animated doors & windows** — bind a contact `binary_sensor`, `cover` or `lock` and openings swing, slide or roll with their real state, partial positions included. A lock reads `unlocked` as open, so a door with no contact sensor still animates.
  - **A sensor per leaf** — anything with two leaves takes a second contact and draws them independently: a casement window with one sash open and one shut, a double door ajar on one side, a pair of shutters with one folded back.
- **Offline devices read as offline** — an entity that is unavailable, unknown, or gone from Home Assistant is dimmed (or crossed out), instead of looking exactly like a device someone switched off.
- **Furniture** — 26 gray line-art diagrams (table, sofa, bed, stove, stairs, tv…), each bindable to an entity, in a searchable picker. Every one is a plain JSON file of numbers you can copy: draw your own in the editor's paste box, use it straight away, and open a PR when it's good. No SVG, so nothing you paste can run anything.
- 🆕 **Live text labels** — bind a text to an entity and it shows the reading: a power figure in the corner, a temperature over a room. Type words in front of it, or leave them out for the number alone.
- **Areas** — trace room polygons that color live from an entity, and link them to Home Assistant areas to scope entity pickers and bulk-add devices.
- **Live position trackers** — map one or two distance sensors (mmWave / radar) onto a marker that moves across the plan in real time.
- **Dead spaces** — hatch the spaces your walls seal off that no door or window reaches: a service shaft, the void behind a boxed-in stairwell. Nothing to draw — the regions come from the walls and openings themselves, so cutting a doorway into one stops it being dead the moment you place the door.
- **Follow the sun** — dim the plan through dusk and brighten it through dawn, from your HA instance's sun elevation. Any light casting light holds the dark back around itself, out to its radius, so a night plan reads as a dark house with lit rooms glowing.
 
<img width="441" height="301" alt="day" src="https://github.com/user-attachments/assets/f3dbfc88-9d06-4f44-81dc-bf499cbd9bd3" />
<img width="444" height="313" alt="night" src="https://github.com/user-attachments/assets/1590b710-d88f-4a34-986b-b08640a45f4c" />


- **Multiple floors** — per-floor elements with a switcher in both the editor and the card. Give a staircase `goToFloor: up` and clicking it takes you there.
- **Background image** — trace over a floor-plan scan, per floor, with adjustable opacity.
- **Skins** — restyle the whole plan from one line of config: `default` follows your Home Assistant theme, `odnetnin` is chunky charcoal on cream, `pastel` is soft and low-contrast, `tron` is neon on near-black. Colors you set on an element yourself always win.
  
<img width="300" height="300" alt="default" src="https://github.com/user-attachments/assets/ce2d6545-10f4-4aa2-bbd7-0dcae08c27f5" />
<img width="300" height="300" alt="odnetnin" src="https://github.com/user-attachments/assets/1d46f7a3-b894-4fcb-bdb9-a55270b8e4e4" />
<img width="300" height="300" alt="tron" src="https://github.com/user-attachments/assets/de5b0825-3bff-4817-8a26-8f887bab8c48" />

- **Auto-scaling** — SVG over a virtual coordinate space, so the plan fits any card size.

## Installation

### HACS (recommended)

Distributed as a **custom repository**. Add it in one click:

[![Open Easy Floorplan in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=nicosandller&repository=easy-floorplan&category=frontend)

…or add it manually:

1. In Home Assistant, open **HACS**.
2. Top-right **⋮ → Custom repositories**.
3. Add repository URL `https://github.com/nicosandller/easy-floorplan` with category
   **Dashboard** (a.k.a. Plugin).
4. Find **Easy Floorplan** in HACS and click **Download**.
5. Hard-refresh your browser (Cmd/Ctrl-Shift-R).

HACS adds the dashboard resource automatically.

### Manual

1. Download `easy-floorplan-card.js` from the [latest release][release-url].
2. Copy it to `<config>/www/easy-floorplan-card.js`.
3. Add it as a dashboard resource (**Settings → Dashboards → ⋮ → Resources → Add**):
   - URL `/local/easy-floorplan-card.js`
   - Type **JavaScript module**
4. Hard-refresh your browser.

## Documentation

| | |
| --- | --- |
| [CONFIGURATION.md](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md) | Every config key: per-element tables, defaults, a worked example |
| [docker/README.md](https://github.com/nicosandller/easy-floorplan/blob/main/docker/README.md) | Running the card against a real Home Assistant in Docker |
| [furniture/README.md](https://github.com/nicosandller/easy-floorplan/blob/main/furniture/README.md) | Authoring a furniture symbol, and contributing one |
| [CONTRIBUTING.md](https://github.com/nicosandller/easy-floorplan/blob/main/CONTRIBUTING.md) | Build commands, and which test suite a change needs |

The rest of this file walks through what you can put on a plan and what each feature does.

## Elements

Everything you place on the plan is an **element**: **devices**, **doors & windows**,
**furniture**, **text**, **areas** and **trackers**. Select, move, nudge, copy/paste,
duplicate and delete them; each floor holds its own set.

### Devices

A **device** binds a Home Assistant entity to a spot on the plan. Add one with **+ Add**,
then pick the entity in the **Element** section below the canvas.

- **Tap to act** — lights, switches, fans and `input_boolean`s toggle on tap; everything
  else opens the more-info dialog. Covers do too, so an accidental tap can't move a
  shutter — set **Tap action** to *Toggle* to opt back in.
- **Label line** — **Show state** displays the live value (sensors do by default),
  formatted as HA would, display precision included; **Show name** adds the name, and
  both read `Name · state`. **Label size** sets the font size. The editor canvas draws
  the same line the card will, so turning one on is visible straight away; a device
  showing neither still gets a dimmed editor-only label so you can tell it apart.
- **Other entities** — **+ Add entity**, right under the first one, appends as many as the
  device has: `21.5 °C · 45% · 1013 hPa`. Each row picks an entity, an attribute, or both
  — leave the entity empty and it reads that attribute off this device, so one climate
  entity can show four of its own numbers. See
  [More readings per device](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#more-readings-per-device).
- **Label position** — **Below** the badge (the default), or hung off its **left** or
  **right**. A reading under a badge grows in both directions and meets whatever sits
  beside it; hung off one side it grows one way only.
- **Badge shows** — one dropdown for what the device draws: *Icon* — **still**,
  **spinning** or **pulsing** — its *Value*, or *Nothing* (label only). **Value** draws
  the reading inside the badge — a thermostat reads `21°` in the circle your state rules
  already paint red — picking it per domain, dropping long units, and falling back to the
  icon when there is no number. See [Fans](#fans) for the animations.
- **Badge reads** — once the device has extra readings (**+ Add entity** under **Other
  entities**) and the badge is showing a value, this names which one it reads. Left alone
  the card takes the first with a number to show, so a smart plug pointed at its power
  sensor reads `1.2kW` without configuring anything — the switch says "on", not a number,
  so the badge falls through. Once you pick, only that entity is read; if it has nothing
  to show the badge falls back to its icon rather than quietly showing the other.
- **Make it yours** — override the **icon** (autocomplete + live preview), the **name**,
  **size** and rotation. Without an override the icon follows the entity's **device
  class** (HA's *show as*), so a lock renders `mdi:lock` / `mdi:lock-open`.
- **Active color** — the badge color while the entity is on, so lights, covers and
  switches are told apart at a glance. A bulb reporting an `rgb_color` wears its own
  instead, darkening as it dims. Full order: **state rules → Active color → the bulb's
  color → the theme**. The glyph flips black or white to stay readable on whatever the
  badge ended up painted.
- **Color & icon by state** — rules restyle the badge, label and icon from the entity's
  reading, whether or not it is "on" (a temperature sensor never is):

  ```yaml
  stateColor:
    - { state: open, color: "#4caf50", icon: mdi:blinds-open }
    - { above: 26, color: red }
    - { color: white }   # default
  ```

  An exact `state` beats a threshold, the highest matching `above` wins, and a rule with
  neither is the default. `icon` is optional and beats the device's own icon while it
  matches — a rule without one keeps that icon, so colouring by state costs nothing when
  the glyph never changes. Rules beat **Active color**, which the editor hides once they
  exist; the **Icon** field stays, since it is still what they fall back to.
- **Only when active** — hide the device on the card while its entity is off, idle or
  unavailable, so a busy room only shows what's doing something. The editor still draws
  it, faded with a dashed badge.
- **No entity? Still on the map** — an unbound device renders as a plain static badge, so
  hardware HA doesn't know about (a dumb smoke detector, a wired doorbell) can still be
  marked. It never highlights and tapping does nothing.

### Animations

Bind an entity and the element stops being a drawing: openings move with their real
state, rooms and furniture recolor, markers glide, icons spin.

#### Press feedback

A tap used to change nothing on screen until the entity itself came back — which on a
cover, or a bulb on a slow bridge, is long enough to wonder whether it registered at all.
Devices now answer the press immediately. Set **Press effect** under **Project**:

| Effect | What it does |
| ------ | ------------ |
| **Press in** (default) | The device dips to 92% and springs back — fast in, slow out, so even a quick tap is visible. |
| **Ink ripple** | A circle spreads and fades from the point you touched. |
| **Flash** | A halo of the skin's accent color, with no movement at all. |
| **None** | Nothing, as before. |

It is one setting for the whole plan rather than per device: it is how the dashboard
feels, and a plan where half the devices answered differently would read as broken.

**Only devices that do something respond.** A device with no entity bound, or with
`tap_action: none` and nothing on hold or double-tap, isn't treated as a button at all: no
press effect, no hand cursor, no tab stop, and no `button` role for a screen reader to
announce. Feedback promising an action that never arrives is worse than none — and an
inert device that answers the keyboard with silence is the same promise, made where it is
hardest to check.

With the OS *reduce motion* preference set, all three fall back to the flash halo with no
transition: the affordance stays, the movement goes.

#### Doors & windows

Drop a **door** or **window** from the toolbar and it snaps onto the nearest wall. Left
unbound it stays a static drawing. Bind an **Entity** — a contact `binary_sensor` or a
`cover` — and the opening tracks its real state. The card reads the entity's HA
`device_class` and picks a sensible `type` / `motion` for you (a `window` cover → a
window, a `blind` → a slider, a `garage` or `shutter` → a roll-up); adjust afterwards.

- **Open / closed** — open when the entity is `on` / `open`. A door's leaf swings around
  its hinge, a window's two leaves outward from the middle — or set **Sashes** to *Single*
  for one sash. The swing arc draws on as the leaf travels.
- **Partial** — a `cover` reporting `current_position` (0–100) is drawn partly open and
  tracks the position live. Everything else uses the on/off behavior above.
- **Motion** — **swing** (default), **slide**, **roll** (a slatted curtain that thins onto
  its track), or **fixed** — a window that does not open at all: a bay window, a picture
  window, a sealed pane. A fixed window is drawn as jambs and glass with no leaf and no
  arc, ignores a bound sensor for its drawing (bind one anyway if you want the tap target
  or the badge), and is never a gap — though it still lets the daylight straight through,
  because it is still glass. Offered on windows; a door that cannot open is a wall.
  Sliding openings take a **Style**, and which one you want comes down to where the panels
  go and what is left clear:

  | Style | Panels | Where they go | What clears |
  | --- | --- | --- | --- |
  | *single* | one moving | into the wall | the whole opening |
  | *bypass* | one moving, one fixed | behind the fixed one | half |
  | *biparting (into the walls)* | two moving | each recesses into its own wall — a pocket door | the whole opening |
  | *biparting (over fixed panels)* | two moving, two fixed | out onto a fixed panel at each jamb | the middle half |
  | *converging* | two moving | toward each other, stacking in the middle | a quarter at each jamb |

  The last two are both patio sliders and they are mirror images: pick *biparting (over
  fixed panels)* if the outer quarters of your door are fixed glass, and *converging* if
  every leaf slides. **Slide** sets the direction; a style that moves both panels has
  none.
- **One sensor per leaf** — anything with two leaves takes a **Second leaf** entity, and
  then each leaf opens and accents on its own state: left open and right shut draws
  exactly that. That means the two-panel sliders above, and any hinged double — a
  casement window (`sash: double`, the window default) or a double door. Leave it empty
  and both leaves follow the first entity, as they always have. The opening's own invert
  switch covers both, and a tap still acts on the first. A lamp's pool follows the leaves
  too: with one open, the light comes through *that* leaf's half of the doorway rather
  than the middle.
- **Sash width** (**Leaf width** on a door) — when only part of the opening actually
  moves and the rest is fixed, set this to the share of the frame the operable leaf
  covers, `0.05`–`1`. The leaf is drawn at that width, hinged at its own jamb, sweeping an
  arc to match, and the remainder is drawn as a fixed pane — so a narrow casement in a
  wide frame stops swinging the whole width of the glass, and a sidelight door stops
  swinging its fixed panel. The pane follows the type: thin glass on a window, solid on a
  door. Single-leaf swing openings only — a double already splits the frame between its
  two leaves. **Hinge** moves the leaf and its pane together.
- **Orientation** — **Hinge** (left / right) and **Opens** (this side / other side) face a
  swing door any of four ways; they're pure mirrors (`flipH` / `flipV`), so the animation
  follows.
- **External shutters** — bind a second `cover` or contact as **Shutter** and it shares
  the wall gap with the opening, rendering independently — so an open window behind a
  closed shutter shows both. **Shutter type** picks *Hinged* (louvered panels folding back
  against the façade) or *Roll-up*, defaulting from the entity. A hinged pair has a
  **Second shutter panel** of its own, on the same terms as the leaf above — a shutter is
  a layer *over* the opening, so a double casement behind a pair of shutters has four
  leaves and can carry four contacts.
- **Active color** — the leaf, sash and arc take an accent color while open. Defaults to
  the primary color.
- **Show icon** — an optional badge beside the opening carrying its own entity's icon,
  which changes with the state, and its dialog on a tap. Off by default: a leaf that has
  swung is still on screen saying so. The roll-up is the case that wants it — raised, its
  curtain has left the floor plane and only the coloured track remains. With a shutter
  bound too, the two badges take opposite faces of the wall.
- **Invert door animation** (**Invert window animation** on a window) — flip the
  open/closed interpretation (and the percentage) for sensors wired the other way. A bound
  shutter gets its own **Invert shutter animation**, since a reed contact on the panels
  routinely disagrees with the sensor behind them about which way round `on` means open.
- **Tap to control** — a controllable `cover` toggles (`cover.toggle`); read-only sensors
  and position-only covers open the more-info dialog.

```yaml
openings:
  # sliding window, patio-door style, driven by a cover
  - { id: patio, type: window, motion: slide, sliderStyle: biparting, x: 640, y: 500, length: 160, angle: 0, entity: cover.patio_door }
  # a two-panel patio slider with a contact on each leaf: the panels stack over
  # the fixed side panels, and each one follows its own sensor
  - { id: bay, type: window, motion: slide, sliderStyle: biparting-bypass, x: 300, y: 500, length: 200, angle: 0, entity: binary_sensor.sliding_door_left, secondaryEntity: binary_sensor.sliding_door_right }
  # the same door with no fixed glass: both leaves slide and stack in the middle
  - { id: terrace, type: window, motion: slide, sliderStyle: converging, x: 300, y: 700, length: 200, angle: 0, entity: binary_sensor.terrace_left, secondaryEntity: binary_sensor.terrace_right }
  # a casement window with a contact on each sash: one open, one shut
  - { id: study, type: window, x: 820, y: 100, length: 120, angle: 0, entity: binary_sensor.study_left, secondaryEntity: binary_sensor.study_right }
  # a single-sash window behind a pair of shutters, one contact per panel
  - { id: kitchen, type: window, sash: single, x: 500, y: 100, length: 120, angle: 0, shutterEntity: binary_sensor.persiana_left, shutterStyle: swing, shutterSecondaryEntity: binary_sensor.persiana_right }
  # a swing door hinged on the right, opening into the other room
  - { id: hall, type: door, x: 300, y: 100, length: 80, angle: 0, flipH: true, flipV: true }
```

<img width="540" height="304" alt="door_window_demo" src="https://github.com/user-attachments/assets/091b3c89-5202-4025-8a0f-0fe867276be2" />

#### Areas

An **area** is a colored, named room polygon traced on top of your walls.

Pick the **Area** tool and click each corner — points snap onto nearby wall corners and
onto other areas' corners, so adjoining rooms share an exact boundary. After 3+ points,
click the **first** point to close the shape (**Backspace** drops the last point,
**Escape** discards the outline). Drag inside the fill to move the room, or a corner
handle to reshape it.

Selected, an area offers **Name** / **Show name**, a **color** and **Fill opacity**, and —
once it's live — the same conditional coloring devices get: **Entity**, **Active color**,
**Active opacity**, **Highlight** (tint the fill, or light up the room's own walls) and
**Color by state** rules. See [Area](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#area) for the full set.

**Linking a Home Assistant area.** The name field autocompletes against your HA areas, and
naming a room after one links the two (a **Linked** badge appears; the **×** unlinks while
keeping the name). A link unlocks two things:

- **Filter entities** (on by default) — any device dropped inside the polygon has its
  entity picker narrowed to that HA area's entities. The room is highlighted on the canvas
  with a **Show all** link, so it's obvious why the list is short. Drag the device out, or
  untick this, and the picker widens again.
- **Add all devices in this HA area** — one click drops a device for every entity in the
  HA area not already on this floor, spread across the room rather than stacked. Click it
  again later to top up.

Overlapping areas resolve by draw order: the last one drawn wins both the fill on top and
which room a device counts as inside.

#### Live position trackers

A **tracker** turns one or two distance sensors into a live marker that moves across the
plan in real time — typically a pair of mmWave / radar / LIDAR sensors aimed along
orthogonal axes, together pinning down an `(x, y)`.

Pick the **Tracker** tool, drag a rectangle over the area to track, then set per axis:

- **X sensor** / **Y sensor** — the distance entity, plus the `min` and `max` readings (in
  the sensor's own units) that correspond to the rectangle's two edges on that axis.
- **Invert** — map a higher reading to the near edge instead of the far one, rather than
  swapping `min` and `max`.
- **Presence** — an optional binary gate, usually the occupancy sibling on the same radar.
  If either axis reports clear, unavailable or unknown, the marker hides — so a stale
  distance reading can't leave a dot pulsing in an empty room.

With both sensors set, a pulsating triangle glides to the resolved point, emitting ripple
rings; readings outside `[min, max]` clamp to the rectangle's edge. With one, a faint
pulsating line spans the unknown axis — honest about knowing only one coordinate. With
neither reporting, nothing renders.

The rectangle itself is editor-only; the card shows just the marker. **Color** and **dot
size** are per tracker.

#### Presence ripples

Turn on a device's **Ripple** toggle and it draws animated concentric rings behind the
badge — set **Badge shows** to *Nothing* for the rings alone. They pulse outward and fade
while the device detects something, and collapse to a faint dot when it's clear, so the
spot stays marked without pulling the eye.

**Ripple color** and **ripple size** are per device (the color follows **Active color**
and state rules unless you set one).

The toggle appears only on devices that detect something where they sit — a
`binary_sensor` whose device class is `motion`, `occupancy`, `presence` or `vibration`, or
a `device_tracker` / `person` — the same way **Cast light** appears only on lights: a ring
claims something is happening there, so it's offered where that claim can be true. A
vibration sensor on a door therefore rings like a motion sensor does. The underlying
`display` key still works on any entity in YAML.

<img width="540" height="304" alt="ripple_demo_gif" src="https://github.com/user-attachments/assets/e43949cf-13a2-48f8-804d-73738299475f" />

#### Fans

A running fan's icon spins, and an active media player or vacuum pulses — the same
defaults Home Assistant's own Tile card uses, with no setup: those devices simply open on
*Icon, spinning* / *Icon, pulsing*. Change **Badge shows** to turn it off, or to force an
animation on any other entity.

An icon only animates while its entity is genuinely active, so a forced spin on an
unavailable fan stays still — a spinning icon is a claim that the thing is running.
Respects the OS *reduced motion* preference.

## Configuration reference

Every key the card accepts — per-element tables, defaults and a full worked example —
is in [CONFIGURATION.md](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md).

## Follow the sun

Set **`sunDimming: true`** and the plan dims through dusk and brightens through dawn.

```yaml
type: custom:easy-floorplan-card
sunDimming: true
sunBrightnessMin: 0.45   # brightness once the sun is fully down (default 0.45)
sunBrightnessMax: 1      # brightness in full daylight (default 1)
```

It reads **`sun.sun`'s `elevation`**, which HA computes continuously from your instance's
latitude, longitude and clock. Being a smooth signal there's nothing to interpolate, and
being server-side, a phone in another timezone sees the same picture. The ramp spans civil
twilight (−6° to +6°) and eases at both ends.

- **Device icons and labels are not dimmed** — they sit above the dimming layer, so a dark
  plan stays readable and lit rooms glow.
- **`sunBrightnessMin` defaults to 0.45, not 0** — a plan you can't read is worse than a
  dim one. Set it lower for a darker house.
- **It fails bright** — a missing or unreadable `sun.sun` leaves the plan at full
  brightness rather than stranded dark.

Toggle it in the editor under **Project → Follow the sun**; the brightness sliders appear
once it's on.

### Lit rooms hold back the night

A flat dim would darken a lit room as much as an empty one, leaving a lamp *less*
noticeable at night than at noon. Instead, **light withholds the dim**: any device with
**Cast light** on clears the darkness around itself, full at the centre and diffusing to
nothing at its `glowRadius` — the same shape and falloff as the pool it casts. Strength
follows brightness; a light that's off, unavailable, or has no Cast light clears nothing.

**Walls stop the clearing**, using the same visibility polygon that stops the pools, so a
lit room brightens itself and not the one next door. Walls are treated as solid along
their whole length — light reaches through no doorway, for the clearing or the pool.

## Dead spaces

A **dead space** is a space the walls close off completely that no door and no window opens
onto: the void behind a boxed-in stairwell, a service shaft, the pocket left over between
two rooms. You cannot get into it, and a plan that draws it like a room is telling you
something untrue about the house. Floor plans conventionally hatch these, and that is what
**`showDeadSpaces: true`** does.

```yaml
type: custom:easy-floorplan-card
showDeadSpaces: true
```

There is nothing to draw and nothing stored. The regions are worked out from the walls and
openings themselves on every render, so they are never out of date:

- close the last wall of a shaft and it hatches itself;
- drop a door or a window anywhere on its boundary and the hatching goes away;
- move a wall and the hatching moves with it.

Toggle it in the editor under **Project → Mark dead spaces**. The editor draws it on the
canvas too, live as you draw — which is the quickest way to check the card agrees with you
about what is actually sealed.

**Why it is off by default.** Marking a doorway by simply leaving a gap in the wall, rather
than placing a door symbol in it, makes a perfectly good plan — and read literally, it is
also a house with no way in. Turning this on for everyone would hatch such a plan end to
end. Whether your walls tell the whole story is your call, so it is yours to switch on.

Two things worth knowing about how the regions are found:

- **A gap in the walls is not a dead space.** Only genuinely closed rings of wall are
  candidates at all, so a room you left open on purpose is never hatched — the feature can
  only ever be wrong in the quiet direction.
- **Walls have to actually meet.** Corners that merely come close do not close a ring. The
  editor's endpoint snapping already makes room corners exact; if a region you expected to
  hatch does not, a corner that missed by a unit or two is the first thing to check.

Anything below a single grid cell in area is ignored, so a sliver where two walls cross
does not leave a smudge on the plan.

## Skins

A skin restyles the whole plan at once — paper, walls, badges, accents — from one line.
Pick one under **Project → Skin**, or set it by hand:

```yaml
type: custom:easy-floorplan-card
skin: tron
```

| Skin | What it looks like |
| --- | --- |
| `default` | Follows your Home Assistant theme, as the card always has. What you get with no `skin` set. |
| `odnetnin` | Playful and chunky: thick charcoal outlines on warm cream, rounded-square badges with a printed-sticker shadow, red accent, bright yellow for anything on. |
| `pastel` | Soft and low-contrast: muted mauve walls on blush paper, peach for active devices. Easy on a dashboard that stays on screen. |
| `tron` | Neon on near-black: thin glowing cyan walls, amber for active devices, light text. Light pools read best here. |

A skin only supplies **fallbacks**, so anything you set on an element yourself still wins —
a room's own `color`, a device's `activeColor`, a `background` on the plan. Switch skins
freely without losing colors you chose by hand.

It deliberately leaves two things alone: the **editor's own chrome** stays in your HA theme
so the canvas reads as the plan, and a **background image** still covers the skin's paper.

### Rolling your own

A skin is a set of CSS custom properties, so [card-mod](#styling-hooks-card-mod) can set
the same ones for the same result — including on top of a skin, to change one thing about
it rather than replace it. A skinned card also carries its id as `data-skin` on the card
element, so a rule can apply to one skin only:

```yaml
type: custom:easy-floorplan-card
card_mod:
  style: |
    ha-card {
      --fp-skin-bg: #101820;
      --fp-skin-wall: #f2aa4c;
      --fp-skin-text: #f2f2f2;
      --fp-skin-accent: #f2aa4c;
    }
```

Values are plain CSS, so quoting them breaks the declaration rather than setting it:
`--fp-skin-wall-width: 5` works, `--fp-skin-wall-width: "5"` draws hairline walls. The
`var()` default can't catch that — a fallback only applies to a property that is *unset*,
never to one set to something invalid.

| Token | Default | Paints |
| --- | --- | --- |
| `--fp-skin-bg` | card background | The canvas paper. |
| `--fp-skin-card-bg` | card background | The card around the canvas. |
| `--fp-skin-wall` | theme text color | Walls, and the jambs and leaves of openings. |
| `--fp-skin-wall-width` | `8` | Wall stroke width. **Keep at 10 or below** — a doorway is a 12-unit gap cut through the wall layer, and a wider wall wouldn't be fully cleared by its own door. |
| `--fp-skin-wall-filter` | `none` | A CSS `filter` on the walls, e.g. `drop-shadow(0 0 4px #22d3ee)`. |
| `--fp-skin-accent` | theme primary | Ripples, trackers, room fills, active doors, the floor switcher. |
| `--fp-skin-accent-ink` | theme text-on-primary | Reading color on the accent. Set it whenever your accent is pale. |
| `--fp-skin-active` | theme active color | Badge color for a device that is on. |
| `--fp-skin-active-ink` | theme text color | Icon/reading color on that badge. Set it whenever the active color is pale. |
| `--fp-skin-text` | theme text color | Labels, free text, room names, card title, editor grid. |
| `--fp-skin-badge-bg` | card background | Badge and label-chip background. |
| `--fp-skin-badge-border` | divider color | Badge border color. |
| `--fp-skin-badge-border-width` | `1.5px` | Badge border weight. |
| `--fp-skin-badge-radius` | `50%` | Badge roundness — `50%` a circle, `30%` a rounded square. |
| `--fp-skin-badge-shadow` | `0 1px 3px rgba(0,0,0,0.2)` | Badge shadow. |
| `--fp-skin-furniture` | `#9e9e9e` | Furniture with no color of its own. |
| `--fp-skin-glow` | `#ffd9a0` | Light-pool color for a bulb that reports none. |

Set them on `ha-card` and the whole plan follows, editor included. Any token you leave
alone keeps its default, so you can restyle one thing without restating the rest.

**On top of a built-in skin, add `!important`.** A `skin:` is applied as an inline `style`
on the card, which outranks a card-mod rule — so without it your override is silently
ignored, and only while a skin is set:

```yaml
type: custom:easy-floorplan-card
skin: tron
card_mod:
  style: |
    ha-card {
      --fp-skin-accent: #f2aa4c !important;
    }
```

## Sunlight

A floor plan is a section through a house, so it has no depth by construction. Letting the
sun in gives it some, from where depth actually comes from.

```yaml
sunlight: true    # light through the windows and open doors
north: 20         # north points 20° clockwise from the top of the canvas
sunBearing: 135   # the sun sits in the south-east; omit to follow the real one
```

**Sunlight** lets the light in through the openings. The sun is far enough away that its
rays arrive parallel, which makes this exact rather than an impression — a wall's shadow is
precisely that wall moved along the light, and the patch a window admits is precisely its
gap moved the same way. So:

- every **window** admits its whole gap, open or shut, because glass is transparent — and
  so does anything `glazed`, which is what a patio or French door is: drawn as a door
  because that is how it swings, but a wall of glass;
- anything **opaque** admits exactly as far as it is open, and no further: a door ajar
  throws a narrow patch, not the one it would throw standing wide open. Sliding styles
  count the gap they actually clear rather than the distance a leaf travels, so a
  converging pair reads the same here as it draws;
- a patch **fades out from its opening** over the distance the light actually travels
  before a wall stops it, so it is always faint by the time it ends, whatever size the
  room is. `sunReach` is the ceiling on that distance, not a fixed span. The falloff is
  an ellipse fitted to the patch — long along the light, narrow across it — so the tip
  rounds off and the flanks dim, instead of the light stopping at an edge;
  What ends a patch is that circle, not the edge of any shape: the beam's outline always
  extends past the point the light has faded to nothing, so you see the arc and never a
  straight cut across the room;
- while the plan follows the real sun, that reach **shortens as the sun climbs** — a patch
  is about as deep as the opening is tall over the tangent of the sun's angle, so a midday
  sun lays a short patch at your feet and an evening one rakes across the room. A pinned
  `sunBearing` states a picture rather than reading the sky, so it keeps the plain reach;
- **walls cast the shade behind them**, cutting the patches — and the part of a door that
  is still shut casts shade like the wall it stands in, while an open doorway casts none,
  the same rule the lamps already follow;
- **only the openings the sun shines on are sources.** Trace back along the light: if a
  wall stands between an opening and the sky, that opening is not letting the sun in. So
  the shaded façade stays dark, and an interior door is never a second sun. Light still
  travels *through* an interior doorway — the beam from the window upstream carries on,
  because that wall's shade has the same gap cut in it — it simply does not start there
  and widen to the doorway's own width (issues #177 / #178);
- a **shutter that is all the way down** stops the light whatever the glass says — that is
  what a shutter is for, and a window behind a closed one is as dark as a wall;
- an opening with `sunlight: false` is **wall to the sun**: no patch of its own, and it
  stops a beam crossing it. That is the answer for a solid front door with no sensor bound
  — the plan draws such a door open, the light believes the drawing, and the corridor
  behind it filled with sunshine the door has never let in;
- everywhere the light never reaches is drawn a shade darker — turn `sunShade` off for the
  patches alone.

`sunBearing` says where the sun **is**; the light travels the opposite way. With the sun in
the south-west it comes in through the south-west windows and falls toward the north-east.

**North** is what makes the angle a statement about the *house*. Without it, "the sun is in
the south-east" would only mean "toward the bottom-left of the drawing", and the same house
traced at a different angle would be lit from the wrong side. Set it once and every bearing
turns with it.

**The sun's height** comes from the same entity while the plan follows it: `sun.sun`'s
`elevation` says whether there is any light at all. Below the horizon nothing is drawn — a
plan does not keep its beams all night — and over the first degrees above it the light
fades in, so sunrise and sunset are a ramp rather than a switch. An unreadable `sun.sun`
leaves the plan lit, never stuck in a night that never ends — and unaimed rather than
aimed wrongly: the bearing falls back to south-east instead of reading a missing azimuth
as due north.

Set `sunBearing` and **the light stays on**, at that angle, around the clock. Stating an
angle is a decision about the picture rather than a reading of the sky, so the elevation
stops applying with it: a plan that pins its sun and then goes dark every evening would be
half-following a sun it had already declined to follow.

**`sunBearing`** pins the light. Leave it out and the plan follows `sun.sun`'s azimuth, so
the light swings through the day — the better picture, but one that moves while you are
laying a plan out, and one with no sensible answer at night. It stacks with
[Follow the sun](#follow-the-sun), which dims the whole plan after dark and has the last
word: there is nothing to let in at night.

Skins can restyle both through `--fp-skin-sunlight` and `--fp-skin-sunshade`.

## Overlay scale

The card draws in two layers. Walls, doors, furniture and room fills are SVG, scaled from
the canvas to whatever width the card gets — draw at any size, they always fit. Badges,
labels, room names and text are HTML on top of that, so they stay upright under `rotation`
and can take clicks.

**A new plan is created with the overlay in canvas units too** (`overlayScale: plan`), so
both layers shrink together and the card looks the same at every size — a scale drawing
rather than a drawing with fixed-size furniture on it. Every measure follows: `size` and
`labelSize` on a device, the reading drawn inside a badge, `size` on text, an area's
`labelSize`, and `rippleSize`. Hairlines deliberately don't — a badge border and a label's
drop shadow are about a pixel either way, and scaling them down is how you lose them.

Sizes then mean the same thing as everything else in the config: `labelSize: 14` is 14
units on a `980`-unit-wide canvas, about 1.4 % of the card's width whatever that turns out
to be.

**The editor previews whichever mode the plan uses.** The canvas sizes its badges and
labels the same way the card will, so the number you type is the number that renders — and
zooming the canvas previews the card at other widths. (Before this it always drew screen
pixels, so a plan in canvas units looked right in the editor and small on the dashboard,
which is what made 1.5's change so hard to place.)

### `fixed`, and when to reach for it

`overlayScale: fixed` pins the overlay to **screen pixels** instead:

```yaml
type: custom:easy-floorplan-card
width: 980
height: 700
overlayScale: fixed
```

That is the original behaviour, and what a config that doesn't mention `overlayScale`
still renders as. It agrees with the drawing only while the card renders at roughly its
canvas size — which is not something a plan gets to
decide, because the dashboard hands it whatever width it has. Below that the two come
apart: a `980`-wide plan shown `500` wide draws every wall at half size while a 14px room
name stays 14px, so names spill past their rooms and collide with the badges under them.
Nothing in the config fixes it, because a label's px size doesn't know what scale the plan
ended up at.

It also loses a **cluster**. A group of badges placed close together — three sensors of the
same physical device, say — has positions that scale with the plan and sizes that do not,
so a cluster neatly spaced on a wide card collides on a narrow one: the badges stay 34px
while the gaps between them shrink. Under `plan` the whole cluster shrinks as one and the
spacing you set is the spacing you keep. (That is the answer to "my grouped icons drift
apart when the card resizes" — though the better answer is often to have no cluster at
all: put the readings on **one** device with [`readings`](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#more-readings-per-device) and
there is no relative position left to preserve.)

> **"It looks right on my computer and wrong on my phone."** Same plan, same config —
> a phone just gives the card less width. Under `fixed` the badges stay 34px and the text
> stays 12px while everything they were spaced against halves, so a badge ends up sitting
> on the label or the free text beside it, and it reads as a label that has moved. Nothing
> has moved: the gaps shrank and the badges did not. `overlayScale: plan` is the answer —
> it is what a plan drawn once and shown at two sizes wants. (Issue #217.)

Reach for `fixed` when the card renders **larger** than its canvas, or on a wall tablet
where a px floor under the text is what keeps it readable from across the room.

> **Upgrading from 1.5.x?** 1.5.0 changed what a *missing* `overlayScale` meant, which
> resized the overlay of every plan that had never set one — including plans whose author
> had deliberately chosen the pixels, since that was the default at the time and the editor
> wrote nothing down for it. On a card narrower than its canvas the badges came out a
> fraction of their size (issue #192). That is undone: **a config with no `overlayScale`
> renders in pixels, as it always did.** Canvas units are what a plan wants, so a card
> added from the picker is created with `overlayScale: plan` written into it — a new
> default belongs in new configs, not in a changed reading of old ones.
>
> If you liked what 1.5 did, add `overlayScale: plan` and keep it — or pick **Canvas
> units** under **Display** in the editor, which now writes your choice down instead of
> omitting it for being the default. Merely opening that panel changes nothing: a plan's
> YAML gains the key when you choose a mode, not because you looked at the setting.

### Where it helps, and where it costs

Scaling with the drawing cuts both ways: it stops text overflowing its room, and it also
keeps shrinking past the point text can be read. On a `980`-wide canvas at the default
sizes (room name `14`, device label `12`):

| Card width | Room name | Device label |
| --- | --- | --- |
| 1200 | 17px | 15px |
| 800 | 11px | 10px |
| 600 | 9px | 7px |
| 450 | 6px | 6px |
| 350 | 5px | 4px |

So `plan` suits a card rendering down to roughly **two-thirds of its canvas width** on the
defaults. Below that it trades collision for illegibility, and the sizes have to come up
to compensate — a `labelSize` of `20`–`24` on a card at half its canvas width lands back
where the default was. That is a real trade, not a free win: sizes are relative, and
nothing puts a floor under them.

So the escape hatch runs both ways. On a card **much** smaller than its canvas, raise the
sizes rather than switching to `fixed` — the geometry is still right, only the numbers are
too small. Switch to `fixed` when the card is rendered **larger** than its canvas, or on a
wall tablet showing the plan at full size where a px floor is what keeps text legible from
across the room.

The rule of thumb: `plan` is what a plan wants, and the size numbers are yours to set.

## More readings per device

One device, as many readings as it has: a sensor reporting temperature, humidity and
pressure needs one badge, not three. The `readings` key is documented in
[CONFIGURATION.md](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#more-readings-per-device).

## Doors on locks

A door with a smart lock and no contact sensor already knows whether it is shut. Bind the
lock and it drives the door (issue #176):

```yaml
openings:
  - { id: front, type: door, x: 300, y: 100, length: 90, angle: 0, entity: lock.front_door }
```

`unlocked` draws the door open, `locked` draws it shut. The in-between states follow the
lock domain's own reading, the same table the device badges use: `unlocking` and a latch
`open` / `opening` count as open, and `locking` is on its way to shut and draws shut.
`invert` flips all of those, for a lock wired the other way round.

**`jammed` is not one of those readings.** A lock that tried to move and could not has a
bolt that is neither thrown nor withdrawn, so it is the same "we don't know" as an
`unavailable` or `unknown` entity: the door draws shut, and `invert` does not get to turn
that into a door standing open.

A lock publishes no position, so the door is fully open or fully shut, never partway.

**A tap on a lock-driven door opens its dialog; it never turns the lock.** That is the
same rule that keeps a tap off a shutter motor: unlocking a front door by brushing the
plan is the worst version of an accidental hardware move. `tap_action: { action: toggle }`
opts in, explicitly.

## Actions on rooms

Rooms answer gestures (issue #181) — tap the floor of a room to run a scene, toggle its
lights, or open a dashboard for it:

```yaml
areas:
  - id: kitchen
    points: [ … ]
    entity: light.kitchen_lights
    hold_action: { action: toggle }
```

**Tap already does something**: it zooms the plan to that room, and has since zooming
existed. So `tap_action` *replaces* the zoom rather than joining it, and leaving it unset
keeps the zoom exactly as it was — every plan drawn before this behaves identically.

That gives three arrangements:

| You want | Set |
| --- | --- |
| Zoom, and an action | the action on `hold_action` or `double_tap_action` |
| An action instead of the zoom | `tap_action` |
| Neither | `tap_action: { action: none }` |

An action's own `entity` wins; without one it falls back to the area's `entity`, so the
example above toggles `light.kitchen_lights` without naming it twice. With no entity
anywhere, only the actions that need none — `navigate`, `url`, `call-service` — do
anything.

A room with an action bound announces itself as a button and takes a tab stop; a room that
only zooms does not, exactly as before.

## Stairs that change floor

A staircase already draws an arrow saying which way it goes. `goToFloor` makes that a
promise the card keeps (issue #121):

```yaml
floors:
  - id: ground
    name: Ground floor
    furniture:
      - { id: stairs_up, type: stairs, x: 640, y: 300, w: 80, h: 140, goToFloor: up }
  - id: upstairs
    name: Upstairs
    furniture:
      - { id: stairs_down, type: stairs, x: 640, y: 300, w: 80, h: 140, goToFloor: down }
```

Click the stairs, change floor. `up` is the next entry in `floors`, `down` the previous —
the list is read bottom-to-top — and the button's tooltip names the floor it leads to.

**At the end of the list it leads nowhere, and stops being a button.** An `up` staircase
on the top floor still draws as a staircase; it just takes no clicks, gets no pointer
cursor and no tab stop. A control that does nothing is worse than no control. It does not
wrap either: the loft is not above the cellar.

The option is on **furniture generally**, not just the built-in `stairs` symbol — a plan
can [draw its own](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#drawing-your-own) staircase, and a rule keyed on one symbol id would
leave those out. It sits under **Behavior** in the furniture panel.

This does not replace the floor switcher in the card's corner; the stairs are a second way
up. Set `floors` and you get both.

## Offline devices

An entity that has dropped out no longer looks like one that is simply switched off.

```yaml
type: custom:easy-floorplan-card
offlineStyle: dim      # dim (default) | strike | none
```

A device counts as **offline** when its entity reads `unavailable` or `unknown`, or when
the entity id is not in Home Assistant at all — renamed, deleted, or from an integration
that failed to load. A device with no entity bound is not offline: those are plain
markers, and there is nothing about them to be wrong.

| `offlineStyle` | What it draws |
| --- | --- |
| `dim` *(default)* | The badge, its icon and its label fade back. |
| `strike` | The same fade, with a diagonal through the badge. Reads from further away. |
| `none` | The pre-#162 behaviour — an offline device looks like any other. |

The default is `dim`, and that **is** a change on upgrade: until now a dead bulb and a
bulb someone turned off were the same picture, and the plan gave that answer confidently.
`none` keeps it for anyone who wants it. Set it in the editor under **Project → Offline
devices**.

The mark's colour is `--fp-offline-mark`, falling back to the theme's `--error-color`, so
card-mod can recolour it without touching anything else. A device drawn as a bare ripple,
or as a label with no badge, has nothing to cross out and takes the fade alone.

## Advanced Hiding Logic

You can fine-tune when an item, its badge, or its state label is hidden. Instead of just hiding an element when its main entity is inactive, you can evaluate specific states, numeric thresholds, or even watch entirely different entities. 

This is available for the **whole item** (`hide...`), the **badge** (`hideBadge...`), and the **state text** (`hideState...`). 

| YAML Key | Type | Description |
| :--- | :--- | :--- |
| `enableHideByEntity` | `boolean` | Activates the advanced hide logic for the whole item. (Use `enableHideBadgeByEntity` / `enableHideStateByEntity` for specific parts). |
| `hideEntity` | `string` | The entity to evaluate. If omitted, the device's main `entity` is used. |
| `hideAttribute` | `string` | Evaluate a specific attribute (e.g., `current_temperature`) instead of the state. |
| `hideMode` | `string` | Set to `"state"` for text matching, or `"threshold"` for numeric comparisons. |
| `hideState` | `string` | The exact string to match (case-insensitive) when using `hideMode: "state"`. |
| `hideOperator` | `string` | The comparison operator (`<`, `<=`, `==`, `!=`, `>=`, `>`) used for thresholds or state matching. |
| `hideThreshold` | `number` | The numeric value to compare against when using `hideMode: "threshold"`. |
| `hideInvert` | `boolean` | If `true`, inverts the final result of the condition. |

The badge and state-text variants take the same eight keys with a `hideBadge` /
`hideState` prefix — `enableHideBadgeByEntity`, `hideBadgeEntity`, `hideBadgeAttribute`,
`hideBadgeMode`, `hideBadgeMatch`, `hideBadgeOperator`, `hideBadgeThreshold`,
`hideBadgeInvert`, and likewise for `hideState...`. (The whole-item key is `hideState`;
the state-text one is `hideStateMatch`.)

**Example:** Hide a badge if the temperature of another sensor drops below 20:
```yaml
enableHideBadgeByEntity: true
hideBadgeEntity: sensor.room_temperature
hideBadgeMode: threshold
hideBadgeOperator: "<"
hideBadgeThreshold: 20
```

**When the sensor doesn't answer.** A condition that can't be evaluated never hides —
a device that vanishes is the one thing you can't debug from the plan. A missing value,
a missing threshold, or a sensor gone `unavailable` under a numeric threshold all leave
the item on screen, and `hideInvert` doesn't flip that. The exception is an outage you
asked for by name: `hideMode: state` with `hideState: unavailable` does hide, so
"hide the badge while this sensor is dead" works as written.

## Compact header

For a dashboard where the top of the card is mostly empty:

```yaml
type: custom:easy-floorplan-card
title: Ground floor
compactHeader: true
```

- The **title** becomes a small chip in the plan's top-left corner instead of an
  `ha-card` header. That header is a fixed ~76px whatever it says — 48px of line-height
  plus its padding — and none of it is reachable from outside `ha-card`, so the only way
  to stop spending it is not to use it.
- The **floor buttons** lay out as a row rather than a column, sharing that one strip
  with the title instead of running down the side.

Off by default, because the title then sits over the drawing — the right trade only when
there is room for it, which is the author's call. Set it in the editor under
**Project → Compact header**.

## Locking elements in place

Select anything and press the padlock in the **Element** header. It applies to every kind
of element — walls, doors and windows, devices, text, furniture, trackers and rooms — and
to a whole multi-selection at once.

A locked element:

- **still selects, still edits, still deletes.** Everything works except *moving* it.
- **never moves.** Not by dragging, not by its endpoint or vertex handles (which stop
  being drawn, so nothing on it pretends to be draggable), and not by arrow keys — alone
  or as part of a group. Drag a group by an unlocked member and the locked ones stay put
  while the rest travel.
- **yields the click.** Anything unlocked under the pointer is picked first, whatever kind
  it is. Lock the wall and a window drawn on it selects on the first click instead of
  after cycling past the wall.

Both halves are the point. Yielding alone would still let a stray drag move the wall;
pinning alone would still cost a click to get past it. Together they answer the thing
that prompted this: *"every time I want to move a window, I end up moving a wall
instead"*.

Locked elements stay selectable on purpose — a design tool hides them behind a layers
panel to unlock from, and this editor has none, so an element you could not click would
be one you could never unlock. Pasted copies are never locked: a duplicate lands offset
and the first thing you do is position it.

Nothing about the rendered card reads this — it is an editing aid, and `locked: true` in
the YAML changes nothing a viewer sees.

## Rotation that follows the screen

A rectangular flat wants its long side across the screen, and which side that is changes
with the device. One `rotation` cannot be right for both, so there are two more:

```yaml
type: custom:easy-floorplan-card
rotation: 0            # the fallback, and what an unset override falls back to
rotationPortrait: 270  # phones
rotationLandscape: 0   # desktop, wall tablet
```

- Set **either** override, or both. An unset one means "same as `rotation`", which is what
  every plan did before these existed — a config that sets neither is completely
  unaffected.
- `0` in an override is a real answer, not "unset". On a plan that is otherwise rotated,
  `rotationLandscape: 0` says *don't* rotate on a desktop. Writing the key with **no
  value** (`rotationPortrait:`) is unset, though — not 0°.
- It follows the **screen's** orientation, not the card's own box. That is what "my
  vertical devices" means, and it keeps a narrow card in a sidebar from rotating itself on
  a landscape desktop. On any current browser it follows the device being turned live,
  with no reload; on an older WebView without a subscribable `matchMedia` it is still
  correct when the page loads and simply stops following turns after that.
- Editing is unaffected. The editor always shows the plan as drawn, as it does for plain
  `rotation`.

In the editor: **Project → Display**, under *Rotate display*.

Icons and labels stay upright at every angle, so a rotated plan is still readable.

## Styling hooks (card-mod)

Every rendered element carries its config `id` as `data-id`, plus a type class, so
[card-mod](https://github.com/thomasloven/lovelace-card-mod) and any other CSS can target
it by something stable.

| Element | Class | Attributes |
| --- | --- | --- |
| Area (fill) | `fp-area` | `data-id`, `data-entity` |
| Dead space | `fp-dead-space` (hatch lines: `fp-dead-space-line`) | — |
| Area (outline) | `fp-area-border` | `data-id`, `data-entity` |
| Furniture | `fp-furniture`, `fp-furniture-<type>` | `data-id`, `data-entity` |
| Door / window | `fp-opening`, `fp-opening-door` \| `fp-opening-window` | `data-id`, `data-entity` |
| Wall | `wall`, `fp-wall` | `data-id` |
| Device | `item`, `fp-item` (plus `offline` while its entity has dropped out) | `data-id`, `data-entity`, `data-kind` |
| Text | `text`, `fp-text` | `data-id` |
| Room name | `area-label` | — |
| Tracker | `tracker`, `fp-tracker` | `data-id` |

Ids come from the editor (`area_a5r5nwl`, `furn_3j66s50`, …) and are stable across edits.

The stage carries the plan-wide modes as classes too — `press-scale` … `press-none`, and
`offline-dim` / `offline-strike` / `offline-none` — so a rule can be scoped to one of
them. The offline mark's own colour is `--fp-offline-mark` (see
[Offline devices](#offline-devices)).

A dead space has no `data-id`, and cannot: it's derived from the walls rather than placed,
so there's nothing for an id to be stable against. Style them as a group —
`.fp-dead-space { fill-opacity: 0.7; }` for a heavier hatch, `.fp-dead-space-line
{ stroke: #c62828; }` to color the lines.

An area is **two** elements answering the same `data-id`: the fill, under the walls, and
the outline, over them. Scope `fill` rules to `.fp-area` — the outline is drawn
`fill="none"`, so an unscoped rule floods it solid:

```css
[data-id="area_hall"]          { fill: #62f202; }  /* also floods the outline */
.fp-area[data-id="area_hall"]  { fill: #62f202; }  /* the fill, as intended */
.fp-area-border[data-id="area_hall"] { stroke-dasharray: 6 4; }
```

Non-`fill` properties — `opacity`, `filter`, `stroke` — are usually fine on both, which is
why the `data-entity` example below is left unscoped.

```yaml
type: custom:easy-floorplan-card
card_mod:
  style: |
    /* One specific room */
    .fp-area[data-id="area_a5r5nwl"] { fill: #62f202; fill-opacity: 0.35; }
    /* Every sofa on the plan */
    .fp-furniture-sofa { opacity: 0.5; }
    /* The element bound to one entity, whatever kind it is */
    [data-entity="light.kitchen"] { filter: drop-shadow(0 0 6px gold); }
```

CSS wins over SVG presentation attributes, so `fill` and `fill-opacity` set this way
override what the card draws.

Note that colouring a room from a sensor needs no CSS — areas take `entity`, `stateColor`,
`activeColor` and `activeOpacity` natively (see [Area](https://github.com/nicosandller/easy-floorplan/blob/main/CONFIGURATION.md#area)) — and restyling the whole
plan doesn't either: the `--fp-skin-*` tokens in [Skins](#skins) are the supported way to
build a look of your own. These hooks are a *styling* surface, not an API: class names are
stable, but the SVG inside an element may change between releases, so target the element
rather than its internals.

## Development

```bash
npm install
npm run build   # bundles to dist/easy-floorplan-card.js
npm run watch   # rebuild on change
npm test        # node suite
npm run ha      # a real Home Assistant in Docker, with a seeded demo plan
```

Build and test commands, and which of the two test suites a change needs, are in
[CONTRIBUTING.md](https://github.com/nicosandller/easy-floorplan/blob/main/CONTRIBUTING.md).
`npm run ha` is the only harness in the repo — what it seeds, the `ha:*` commands and how
to pin a Home Assistant version are in
[docker/README.md](https://github.com/nicosandller/easy-floorplan/blob/main/docker/README.md).

## License

[MIT](LICENSE)

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[release-badge]: https://img.shields.io/github/v/release/nicosandller/easy-floorplan
[release-url]: https://github.com/nicosandller/easy-floorplan/releases
[license-badge]: https://img.shields.io/github/license/nicosandller/easy-floorplan
