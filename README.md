# Product-Forge
A credible client-side application for free, user-friendly rapid prototyping.

## Description
Product-Forge lets you build a simple part in 3D and check whether it would hold a load. Place cubes, spheres and cylinders, resize them, and choose a material. The Results Panel then shows the part's volume, mass, cross-sectional area, stress and factor of safety.

The app has two parts that run together:

- **Front end:** React, Vite and Three.js (`@react-three/fiber` and `@react-three/drei`). It draws the 3D scene, the Control Panel and the Results Panel.
- **Back end:** a small Python HTTP server that uses only the standard library. It does the engineering calculations and sends the results back to the front end.

## Contents
```
Product-Forge/
├── back-end/
│   ├── main.py          # HTTP server: POST /analyze on http://127.0.0.1:8000
│   ├── functions.py     # volume, mass, area, stress and safety-factor calculations
│   └── materials.json   # material properties (density, yield and ultimate strength)
├── front-end/
│   ├── dev.js           # starts the back end and the Vite dev server together
│   ├── package.json
│   └── src/
│       ├── App.tsx                  # app state and layout
│       ├── components/
│       │   ├── ControlPanel.tsx     # add/delete parts, edit position, rotation, scale and material
│       │   ├── SceneCanvas.tsx      # 3D view and transform handles
│       │   └── ResultsPanel.tsx     # asks the back end for results and displays them
│       ├── lib/types.ts             # Part class, shapes and materials
│       └── materials.json           # material display colors
└── .github/
    ├── CODEOWNERS
    └── workflows/discord-notifier.yml   # posts each push to the team Discord
```

## Installation
You need:
- [Node.js](https://nodejs.org/). The project was developed with v22.16.0.
- [Python 3.10 or newer](https://www.python.org/downloads/). It must be on your PATH: `py` on Windows, or `python3` on macOS and Linux.

Then, from the repository root, install the front-end packages once:
```bash
cd front-end
npm install
```
The back end has no packages to install.

## Usage
### Running the app
From the `front-end` folder:
```bash
npm run dev
```
This starts both servers:
- the back end at `http://127.0.0.1:8000`
- the front end at the address Vite prints, usually `http://localhost:5173`

Open the front-end address in your browser. Press **Ctrl+C** in the terminal to stop both.

| Command (run in `front-end`) | What it does |
|---|---|
| `npm run dev` | Starts the back end and the front end together |
| `npm run dev:frontend` | Starts only the front end (results won't load without the back end) |
| `npm run build` | Type-checks and builds the front end |
| `npm run lint` | Runs ESLint |

To run the back end by itself, start it from the `back-end` folder:
```bash
py main.py         # Windows
python3 main.py    # macOS / Linux
```

### Using the app
1. In the Control Panel, choose a shape under **New Part** and click **Add**.
2. Click a part to select it. The Results Panel shows its results.
3. Change the part's position, rotation, scale and material in the Control Panel, or drag the handles in the 3D view.

| Input | Action |
|---|---|
| Left mouse | Select a part / orbit the camera |
| Right mouse | Pan the camera |
| Middle mouse / scroll | Zoom |
| `1` / `2` / `3` | Handles move / rotate / scale the selected part |

The results update after each change in the Control Panel, and when you release a handle in the 3D view.

### Troubleshooting
- **"Failed to fetch" in the Results Panel:** the back end isn't running. Start the app with `npm run dev`, or run `main.py` yourself.
- **"Port 8000 is already in use":** another copy of the back end is already running. Close it and run `npm run dev` again.
- **"Python not found":** install Python 3 and make sure `py` (Windows) or `python3` (macOS/Linux) works in a terminal.

## Calculations and units
All results are calculated by the back end (`back-end/functions.py`).

### Units
| Quantity | Unit | Notes |
|---|---|---|
| Scale / dimensions | cm | **1 scene unit = 1 cm** (`UNIT_TO_CM` in `functions.py`) |
| Rotation | radians | entered in the Control Panel; not used in the calculations |
| Volume | cm³ | |
| Mass | g | volume × density |
| Cross-sectional area | cm² | |
| Force | N | fixed at **500 N** (`FORCE` in `back-end/main.py`) |
| Stress | MPa (N/mm²) | force ÷ area (1 cm² = 100 mm²) |
| Density | g/cm³ | from `materials.json` |
| Yield / ultimate strength | MPa | from `materials.json` |
| Factor of safety | none (a ratio) | yield strength ÷ stress |

### Shapes
Each part is a base shape stretched by its scale (x, y, z). The base shapes are the same sizes the 3D view draws.

| Shape | Base shape | Volume | Cross-section (x–z plane) |
|---|---|---|---|
| cube | 1 × 1 × 1 box | x · y · z | x · z |
| sphere | sphere of radius 0.5 | 4/3 · π · (x/2)(y/2)(z/2) | π · (x/2)(z/2) |
| cylinder | upright cylinder, radius 0.5, height 1 | π · (x/2)(z/2) · y | π · (x/2)(z/2) |

For a sphere, the cross-section is the largest one, through its center.

### Safety
- The force pushes straight along the part's y axis, so the stress is the force divided by the x–z cross-section.
- **Factor of safety = yield strength ÷ stress.** A part is **Safe** when the factor of safety is at least 1, and **Not safe** below 1.

### Materials
| Material | Density (g/cm³) | Yield strength (MPa) | Ultimate strength (MPa) |
|---|---|---|---|
| wood | 0.6 | 5.31 | 5.31 |
| aluminum | 2.6989 | 34 | 90 |
| plastic | 1.30 | 45.2 | 57.3 |

These are simplified averages from [MatWeb](https://www.matweb.com/) and [AmesWeb](https://amesweb.info/Materials/Aluminum-Yield-Tensile-Strength.aspx).

To add a material, add it with the same name to both `back-end/materials.json` (properties) and `front-end/src/materials.json` (display color).

### Limitations
This is a quick prototyping estimate, not an engineering analysis:
- It only checks a single load along the part's y axis. Bending, buckling, torsion and contact between parts are not modelled.
- Position and rotation don't affect the results, and every part is analysed on its own.
- The force is fixed at 500 N and can't be changed from the app yet.

## API
The back end has one endpoint.

**`POST http://127.0.0.1:8000/analyze`**

Request:
```json
{
  "shape": "cube",
  "scale": { "x": 5, "y": 2, "z": 10 },
  "material": "wood",
  "force": 500
}
```
- `shape` must be `cube`, `sphere` or `cylinder`.
- `material` must be `wood`, `aluminum` or `plastic`.
- `force` (in N) is optional and defaults to 500.

Response (`200`):
```json
{
  "volume": 100.0,
  "mass": 60.0,
  "cross-section": 50.0,
  "stress": 0.1,
  "safety": 53.1,
  "is_safe": true
}
```
Invalid input returns `400` with `{ "error": "..." }`.

The server only answers browser requests from front ends running on `localhost` or `127.0.0.1`, on any port.

## Testing
- Back-end self-test (all shapes × all materials), run from `back-end`: `py main.py --test` on Windows, or `python3 main.py --test` on macOS/Linux. It exits with code 0 when every calculation succeeds.
- Front end, run from `front-end`: `npm run lint` and `npm run build`.

## Contributing
- Create a branch from `main` and open a pull request back into `main`.
- `main` is protected. A pull request needs one approving review, including a review from a code owner (see `.github/CODEOWNERS`).
- Every push posts a message to the team Discord.

## License
No license has been chosen yet.
