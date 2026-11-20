from math import pi
import json
import os

"""
Matches the front-end (front-end/src/lib/types.ts and SceneCanvas.tsx):

shapes:    "cube", "sphere", "cylinder"
materials: "wood", "aluminum", "plastic"
scale:     {"x": ..., "y": ..., "z": ...}  (the part's scale vector)

Every part is a base shape stretched by its scale:
    cube     -> 1 x 1 x 1 box               -> box of x * y * z
    sphere   -> radius 0.5                  -> ellipsoid with semi-axes x/2, y/2, z/2
    cylinder -> radius 0.5, height 1 (on y) -> elliptic cylinder, semi-axes x/2 and z/2, height y

Load is applied along the y axis (vertical), so the cross-section is the x-z plane.

Units:
    scale  -> cm (1 scene unit = 1 cm, see UNIT_TO_CM)
    force  -> N
    stress -> MPa (same units as the strengths in materials.json)

"""

MATERIALS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "materials.json")

SHAPES = ("cube", "sphere", "cylinder")
AXES = ("x", "y", "z")

# Size of one front-end scene unit in cm
UNIT_TO_CM = 1.0


def validateTypes(measurements, defaultType=float, *args):
    """
    use to check if the measurements dictionary contains only numbers
    Args:
        measurements (dictionary): a dictionary of measurements to check
        defaultType: the data type every entry should be. float by default
        *args: additional data types to allow
    Returns:
        boolean: true if all entries are one of the allowed types. false if any entry is not
    """
    validTypes = (defaultType,) + args

    valid = True

    for item in measurements:
        value = measurements[item]
        # bool is a subclass of int, so reject it explicitly
        if isinstance(value, bool) or not isinstance(value, validTypes):
            print(f"{value} is an invalid type: {type(value)}")
            valid = False

    return valid


def checkScale(scale):
    """ Checks that the scale has x, y and z, and that each is a positive number (int or float).

        Args:
            scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.

        Returns:
            int: If the scale is valid, return 0. Else, return -1.

    """

    missing = [axis for axis in AXES if axis not in scale]
    if missing:
        print(f"Scale is missing: {', '.join(missing)}")
        return -1

    if not validateTypes(scale, float, int):
        return -1

    invalid_measurement_present = False

    for axis in AXES:
        # Ensures positive measurements
        if scale[axis] <= 0:
            print(f"Scale {axis} is invalid: value cannot be 0 or less")
            invalid_measurement_present = True

    if invalid_measurement_present:
        return -1

    return 0


def get_dimensions(scale):
    """ Converts a scale in scene units to dimensions in cm.

    Args:
        scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.

    Returns:
        tuple: (x, y, z) in cm.
    """
    return (scale["x"] * UNIT_TO_CM, scale["y"] * UNIT_TO_CM, scale["z"] * UNIT_TO_CM)


def calculate_volume(shape, scale):
    """ Computes the volume of a part.

    Args:
        shape (str): "cube", "sphere" or "cylinder".
        scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.

    Returns:
        volume (float): the volume of the part in cm^3, or -1 if the shape or scale is invalid.
    """

    if checkScale(scale) != 0:
        return -1

    x, y, z = get_dimensions(scale)

    match shape:
        case "cube":
            # V = x * y * z
            return x * y * z

        case "sphere":
            # V = 4/3 * pi * a * b * c, with semi-axes a = x/2, b = y/2, c = z/2
            return (4/3) * pi * (x / 2) * (y / 2) * (z / 2)

        case "cylinder":
            # V = pi * a * c * h, with semi-axes a = x/2, c = z/2 and height h = y
            return pi * (x / 2) * (z / 2) * y

        case _:
            print(f"Invalid shape: {shape}. Expected one of {SHAPES}")
            return -1


def calculate_mass(volume, density):
    """ Computes the mass of a part given its volume and density.

    Args:
        volume (int or float): the volume of the part (in cm^3)
        density (int or float): the density of the material (in g/cm^3)

    Returns:
        mass (int or float): the mass of the part as the product of its volume and density (in g), or -1 if either input is invalid
    """
    if volume > 0 and density > 0:
        return volume * density

    else:
        return -1


def calculate_cross_section_area(shape, scale):
    """ Computes the area of a part's cross-section in the x-z plane (the load is along y).

    Args:
        shape (str): "cube", "sphere" or "cylinder".
        scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.

    Returns:
        area (float): the cross-sectional area in cm^2, or -1 if the shape or scale is invalid.
        For a sphere this is the largest cross-section (through its center).
    """

    if checkScale(scale) != 0:
        return -1

    x, y, z = get_dimensions(scale)

    match shape:
        case "cube":
            # A = x * z
            return x * z

        case "sphere" | "cylinder":
            # A = pi * a * c (ellipse), with semi-axes a = x/2, c = z/2
            return pi * (x / 2) * (z / 2)

        case _:
            print(f"Invalid shape: {shape}. Expected one of {SHAPES}")
            return -1


def calculate_stress(force_applied, shape, scale):
    """ Computes the stress on a part when a force is applied along y.

        Args:
            force_applied (int or float): the applied force in N.
            shape (str): "cube", "sphere" or "cylinder".
            scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.

        Returns:
            stress (float): the applied force divided by the cross-sectional area, in MPa (N/mm^2),
                            or -1 if the inputs are invalid.
    """

    if force_applied <= 0:
        print("Applied force must be greater than 0")
        return -1

    cross_sectional_area = calculate_cross_section_area(shape, scale)
    if cross_sectional_area <= 0:
        return -1

    # stress = Applied Force / Area
    # area is in cm^2; 1 cm^2 = 100 mm^2, and N/mm^2 = MPa
    return force_applied / (cross_sectional_area * 100)


def calculate_safety_factor(max_stress, working_stress):
    """ Computes the factor of safety of a design.

    Args:
        max_stress (int or float): the maximum stress the material can withstand (yield or ultimate strength), in MPa.
        working_stress (int or float): the stress on the part, in MPa (from calculate_stress).

    Returns:
        factor_of_safety (float): max_stress / working_stress, or -1 if either input is invalid.
    """
    if max_stress <= 0 or working_stress <= 0:
        print("Max stress and working stress must both be greater than 0")
        return -1

    # Factor of Safety (FoS) = Max stress(ultimate or yield) / working stress
    # Use ultimate strength for brittle materials and yield strength for ductile materials
    return max_stress / working_stress


def evaluate_safety(max_stress, working_stress):
    """ Determines whether a design is safe based on its factor of safety.

    Args:
        max_stress (int or float): the maximum stress the material can withstand, in MPa.
        working_stress (int or float): the stress on the part, in MPa (from calculate_stress).

    Returns:
        design_is_safe (bool): True if the factor of safety is at least 1, otherwise False (including invalid inputs).
    """
    factor_of_safety = calculate_safety_factor(max_stress, working_stress)

    # If FoS is greater than or equal to 1, then the structure is safe. The structure is unsafe otherwise.
    return factor_of_safety >= 1


def load_materials(path=MATERIALS_PATH):
    """ Loads the material data from materials.json.

    Args:
        path (str): path to the materials file. Defaults to the materials.json next to this file.

    Returns:
        dict: material name -> {Density, Yield-Strength, Ultimate-Strength}, or an empty dict if it can't be read.
    """
    try:
        with open(path, "r") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        print(f"Could not load materials from {path}: {error}")
        return {}


def analyze_part(shape, scale, material_name, force_applied, materials=None):
    """ Runs every calculation for one part, using the same inputs the front-end stores on a Part.

    Args:
        shape (str): "cube", "sphere" or "cylinder".
        scale (dict): the part's scale, {"x": ..., "y": ..., "z": ...}.
        material_name (str): "wood", "aluminum" or "plastic".
        force_applied (int or float): the force applied along y, in N.
        materials (dict): material data. Loaded from materials.json if not given.

    Returns:
        dict: the same keys the Results Panel reads from back-end/dummy.json:
              volume (cm^3), mass (g), cross-section (cm^2), stress (MPa), safety (factor of safety),
              plus is_safe. Returns {"error": message} if the inputs are invalid.
    """
    if materials is None:
        materials = load_materials()

    if material_name not in materials:
        return {"error": f"Unknown material: {material_name}"}

    properties = materials[material_name]

    # Stop at the first invalid result so errors aren't repeated down the chain
    volume = calculate_volume(shape, scale)
    if volume == -1:
        return {"error": "Invalid shape or scale"}

    stress = calculate_stress(force_applied, shape, scale)
    if stress == -1:
        return {"error": "Invalid force"}

    mass = calculate_mass(volume, properties["Density"])
    factor_of_safety = calculate_safety_factor(properties["Yield-Strength"], stress)
    if -1 in (mass, factor_of_safety):
        return {"error": "Invalid material data"}

    return {
        "volume": volume,
        "mass": mass,
        "cross-section": calculate_cross_section_area(shape, scale),
        "stress": stress,
        "safety": factor_of_safety,
        "is_safe": factor_of_safety >= 1,
    }


def test_functions():
    """ A series of tests for determining function performance.

        Args:
            none.

        Returns:
            int: 0 if every sample calculation produced a valid result, -1 otherwise.
    """
    materials = load_materials()
    if not materials:
        return -1

    # Test values: a 5 x 2 x 10 cm part with the load along y
    force_applied = 500
    scale = {"x": 5.0, "y": 2.0, "z": 10.0}

    all_valid = True

    for shape in SHAPES:
        for material_name in materials:
            result = analyze_part(shape, scale, material_name, force_applied, materials)

            if "error" in result:
                print(f"{shape} / {material_name}: {result['error']}")
                all_valid = False
                continue

            safety = "safe" if result["is_safe"] else "not safe"
            print(f"{material_name} {shape} is: {safety} with force of {force_applied} N applied. Scale (cm): {scale}")
            print(f"Volume: {result['volume']:.2f} cm^3 | Mass: {result['mass']:.2f} g | "
                  f"Cross-section: {result['cross-section']:.2f} cm^2 | "
                  f"Stress: {result['stress']:.4f} MPa | Factor of safety: {result['safety']:.2f}")
            print()

    return 0 if all_valid else -1
