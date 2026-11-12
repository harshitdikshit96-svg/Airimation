# Airimation's own 3D models for symbols with no open model: trishul,
# kalash, lotus and Om. Made by script in Blender (free), so they are ours
# outright and can be regenerated or tweaked.
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python scripts/blender/make-symbols.py -- ../Scans/made
#
# Writes <out>/trishul.glb, kalash.glb, lotus.glb, om.glb. Then convert each
# with scripts/scan-to-formation.mjs (licence: Airimation's own).
#
# Units are arbitrary (the converter normalises height). Y is up in the
# exported GLB (Blender's Z-up is converted by the glTF exporter).

import bpy
import bmesh
import math
import os
import sys

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "made")
os.makedirs(OUT, exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def export(name):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f"{name}.glb"), export_format="GLB", use_selection=True)
    print(f"wrote {name}.glb")


def to_mesh(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return obj


def curve_tube(points, radius, name, taper_end=False):
    """A tube along a polyline (x, z) in the front plane, round section."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for i, (x, z) in enumerate(points):
        sp.points[i].co = (x, 0, z, 1)
        if taper_end:
            sp.points[i].radius = max(0.05, 1 - i / (len(points) - 1))
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    return to_mesh(ob)


def blade(x, z, length, width, angle=0.0, name="blade"):
    """A leaf-shaped spear blade: a flattened spindle, pointed at the top,
    its base at (x, z), leaning `angle` radians from vertical (+ = right).
    Built vertex by vertex, so no operator state can move it."""
    seg, rings = 24, 16
    bm = bmesh.new()
    rows = []
    for j in range(rings + 1):
        t = j / rings
        r = width * math.sin(math.pi * min(1.0, t * 1.05) ** 0.8) * (1 - 0.6 * t)
        row = []
        for k in range(seg):
            u = 2 * math.pi * k / seg
            lx, ly, lz = r * math.cos(u), 0.35 * r * math.sin(u), t * length
            # Lean about the base point.
            rx = lx * math.cos(angle) + lz * math.sin(angle)
            rz = -lx * math.sin(angle) + lz * math.cos(angle)
            row.append(bm.verts.new((x + rx, ly, z + rz)))
        rows.append(row)
    for a_, b_ in zip(rows, rows[1:]):
        for k in range(seg):
            bm.faces.new((a_[k], a_[(k + 1) % seg], b_[(k + 1) % seg], b_[k]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def trishul():
    reset()
    # Shaft, with a collar where the head meets it.
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.045, depth=2.6, location=(0, 0, -0.6))
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.09, depth=0.12, location=(0, 0, 0.72))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.03, location=(0, 0, 0.58))
    # The three prongs rise from a crescent crossbar.
    curve_tube([(-0.55, 1.35), (-0.5, 1.05), (-0.38, 0.88), (-0.2, 0.8), (0, 0.78), (0.2, 0.8), (0.38, 0.88), (0.5, 1.05), (0.55, 1.35)], 0.04, "crossbar")
    blade(0, 0.78, 1.05, 0.13, name="centre")  # centre spear, tallest
    blade(-0.55, 1.3, 0.45, 0.09, angle=-0.12, name="left")
    blade(0.55, 1.3, 0.45, 0.09, angle=0.12, name="right")
    # A small damru tied below the head, as on Shiva's trishul.
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.12, radius2=0.03, depth=0.16, location=(0, 0, 0.37))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.03, radius2=0.12, depth=0.16, location=(0, 0, 0.21))
    export("trishul")


def lathe(profile, name, segments=48):
    """Surface of revolution of an (r, z) profile around the Z axis."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        ring = [bm.verts.new((r * math.cos(2 * math.pi * k / segments), r * math.sin(2 * math.pi * k / segments), z)) for k in range(segments)]
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(segments):
            bm.faces.new((a[k], a[(k + 1) % segments], b[(k + 1) % segments], b[k]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def kalash():
    reset()
    # Pot: round belly, narrow neck, flared lip.
    lathe(
        [(0.02, 0.0), (0.22, 0.0), (0.24, 0.06), (0.5, 0.14), (0.66, 0.36), (0.66, 0.6), (0.5, 0.8), (0.24, 0.92), (0.18, 0.98), (0.18, 1.04), (0.32, 1.08), (0.36, 1.12)],
        "pot",
    )
    # Coconut on top, sitting in the leaves.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.2, location=(0, 0, 1.36))
    bpy.context.object.scale = (1, 1, 1.25)
    # Seven mango leaves fanned up and out from the mouth, drawn as outlines.
    for k in range(7):
        petal_outline(0.5, 0.09, 1.0, 2 * math.pi * k / 7, f"leaf{k}").location = (0, 0, 1.1)
    # A raised band round the belly.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.67, minor_radius=0.025, location=(0, 0, 0.5))
    export("kalash")


def petal_outline(length, width, tilt, turn, name):
    """One lotus petal drawn as its OUTLINE (a thin tube): in drones an
    outline reads crisply, while overlapping solid petals blur to a cloud."""
    pts = []
    n = 28
    for k in range(n + 1):
        t = k / n  # 0 -> 1 -> back down the other side
        side = 1 if t <= 0.5 else -1
        s_ = t * 2 if t <= 0.5 else (1 - t) * 2  # 0 at base, 1 at tip
        x = side * width * math.sin(math.pi * s_ ** 0.75) * (1 - 0.15 * s_)
        z = length * s_
        # Petals cup inward: the tip curls toward the centre.
        y = -0.18 * length * s_ * s_
        # Tilt out from vertical about X, then turn to its slot about Z.
        y2 = y * math.cos(tilt) - z * math.sin(tilt)
        z2 = y * math.sin(tilt) + z * math.cos(tilt)
        xr = x * math.cos(turn) - y2 * math.sin(turn)
        yr = x * math.sin(turn) + y2 * math.cos(turn)
        pts.append((xr, yr, z2))
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.014
    cu.bevel_resolution = 2
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, (x, y, z) in enumerate(pts):
        sp.points[i].co = (x, y, z, 1)
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    return to_mesh(ob)


def lotus():
    reset()
    # (petals, length, half-width, tilt from vertical, turn offset): a cup.
    rings = [(8, 0.62, 0.2, 0.95, 0.0), (8, 0.55, 0.17, 0.55, math.pi / 8), (5, 0.42, 0.14, 0.22, 0.0)]
    for r, (count, length, width, tilt, offset) in enumerate(rings):
        for k in range(count):
            petal_outline(length, width, tilt, 2 * math.pi * k / count + offset, f"petal{r}_{k}")
    # Seed pod: a small ring at the heart.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.02, location=(0, 0, 0.12))
    export("lotus")


def om():
    reset()
    fonts = os.path.join(os.path.dirname(bpy.app.binary_path), "..", "Resources", bpy.app.version_string[:3], "datafiles", "fonts")
    path = os.path.join(fonts, "NotoSansDevanagari-Regular.woff2")
    font = bpy.data.fonts.load(path)
    cu = bpy.data.curves.new("om", "FONT")
    cu.body = "ॐ"
    cu.font = font
    cu.extrude = 0.04
    cu.bevel_depth = 0.012
    ob = bpy.data.objects.new("om", cu)
    bpy.context.collection.objects.link(ob)
    # Stand the glyph up facing the audience (Blender text lies in XY).
    ob.rotation_euler = (math.pi / 2, 0, 0)
    to_mesh(ob)
    export("om")


for make in (trishul, kalash, lotus, om):
    make()
