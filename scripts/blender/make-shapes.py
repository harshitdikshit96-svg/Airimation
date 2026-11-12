# Airimation's own 3D models of the nine geometric shapes in Design a Show:
# globe, double helix, atom, torus knot, cube, rising spiral, brilliant-cut
# diamond, pyramid and starburst. Made by script in Blender (free), so they
# are ours outright and can be regenerated or tweaked.
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python scripts/blender/make-shapes.py -- ../Scans/made/shapes
#
# Writes <out>/globe.glb, helix.glb, atom.glb, knot.glb, cube.glb,
# spiral.glb, diamond.glb, pyramid.glb, starburst.glb. Then convert each
# with scripts/scan-to-formation.mjs (licence: Airimation's own).
#
# Why tubes: the converter samples points uniformly by SURFACE AREA, then
# farthest-point samples them. A drone shape like these reads as LINES of
# light (a wireframe globe, orbit rings, facet edges), so every line is a
# thin tube: the samples land on the lines, never spread over faces. Solid
# parts (a nucleus, a burst's core) are small spheres.
#
# Each shape follows the archived designer's generator of the same name
# (src/lib/show/formations/playful.ts, geometric.ts) — same lines, same
# proportions — in units of its `scale`. Units are arbitrary (the converter
# normalises height). Coordinates below are written Y-up like the
# generators; P() maps them to Blender's Z-up, and the glTF exporter maps
# back, so the GLB is Y-up.

import bpy
import math
import os
import sys

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "made/shapes")
os.makedirs(OUT, exist_ok=True)

# Tube radius, in generator units (shapes are ~1.5-1.7 units tall): thin
# enough that samples sit on the line's centre at 100-2,000 points.
R = 0.012
TAU = 2 * math.pi


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def export(name):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f"{name}.glb"), export_format="GLB", use_selection=True)
    print(f"wrote {name}.glb")


def P(x, y, z):
    """Generator coordinates (Y up, Z toward the audience) -> Blender (Z up)."""
    return (x, -z, y)


def to_mesh(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return obj


def tube(points, name, radius=R, closed=False):
    """A round tube along a 3D polyline of Y-up points."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 2
    cu.use_fill_caps = not closed
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for i, p in enumerate(points):
        sp.points[i].co = (*P(*p), 1)
    sp.use_cyclic_u = closed
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    return to_mesh(ob)


def curve(f, n, name, radius=R, closed=False):
    """A tube along t -> f(t), t in [0, 1]."""
    pts = [f(k / n) for k in range(n if closed else n + 1)]
    return tube(pts, name, radius, closed)


def segment(a, b, name, radius=R):
    return tube([a, b], name, radius)


def ball(centre, radius, name):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=radius, location=P(*centre))
    bpy.context.object.name = name


def rot_y(p, a):
    x, y, z = p
    return (x * math.cos(a) + z * math.sin(a), y, -x * math.sin(a) + z * math.cos(a))


def rot_x(p, a):
    x, y, z = p
    return (x, y * math.cos(a) - z * math.sin(a), y * math.sin(a) + z * math.cos(a))


def fibonacci(count):
    golden = math.pi * (3 - math.sqrt(5))
    out = []
    for i in range(count):
        y = 1 - (i / max(count - 1, 1)) * 2
        r = math.sqrt(max(0.0, 1 - y * y))
        out.append((math.cos(golden * i) * r, y, math.sin(golden * i) * r))
    return out


def globe():
    """A wireframe globe: meridians and parallels."""
    reset()
    r = 0.8
    # Few lines on purpose: at 100 drones a dense graticule dissolves into a
    # dotted ball; three great circles and three parallels still read as
    # lines, and they stay crisp at 2,000.
    meridians = 3  # great circles -> 6 meridian lines, 60 degrees apart
    for m in range(meridians):
        lon = m / meridians * math.pi
        curve(lambda t, lon=lon: rot_y((math.cos(t * TAU) * r, math.sin(t * TAU) * r, 0), lon), 96, f"meridian{m}", closed=True)
    for k, lat in enumerate((-45, 0, 45)):
        a = math.radians(lat)
        rr = math.cos(a) * r
        curve(lambda t, rr=rr, a=a: (math.cos(t * TAU) * rr, math.sin(a) * r, math.sin(t * TAU) * rr), 96, f"parallel{k}", closed=True)
    export("globe")


def helix():
    """A DNA double helix: two strands and the rungs between them."""
    reset()
    # Fewer, taller turns than the archived generator (2.4 turns, 1.5 high),
    # which at 100 drones read as a coiled spring: the strands need room
    # between them for the rungs to show.
    turns, r, height = 1.6, 0.5, 1.8
    for s, off in enumerate((0, math.pi)):
        curve(lambda t, off=off: (math.cos(t * TAU * turns + off) * r, -height / 2 + t * height, math.sin(t * TAU * turns + off) * r), 240, f"strand{s}")
    rungs = 8
    for i in range(rungs):
        t = (i + 0.5) / rungs
        a = t * TAU * turns
        y = -height / 2 + t * height
        segment((math.cos(a) * r, y, math.sin(a) * r), (-math.cos(a) * r, y, -math.sin(a) * r), f"rung{i}", radius=R * 0.8)
    export("helix")


def atom():
    """An atom: three tilted orbits round a nucleus."""
    reset()
    r = 0.78
    for k, (tilt_x, spin_y) in enumerate(((0, 0), (math.pi / 3, math.pi / 3), (-math.pi / 3, 2 * math.pi / 3))):
        curve(lambda t, tx=tilt_x, sy=spin_y: rot_y(rot_x((math.cos(t * TAU) * r, math.sin(t * TAU) * r * 0.42, math.sin(t * TAU) * r), tx), sy), 120, f"orbit{k}", closed=True)
    ball((0, 0, 0), 0.14, "nucleus")
    export("atom")


def knot():
    """A (2, 3) torus knot: one line, endlessly looping."""
    reset()
    p, q, r = 2, 3, 0.52

    def f(t):
        a = t * TAU
        rad = r * (2 + math.cos(q * a))
        return (rad * math.cos(p * a) / 2, r * math.sin(q * a) * 1.25, rad * math.sin(p * a) / 2)

    curve(f, 420, "knot", closed=True)
    export("knot")


def cube():
    """A cube as its twelve edges."""
    reset()
    h = 0.7
    corners = [(sx * h, sy * h, sz * h) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
    k = 0
    for i, a in enumerate(corners):
        for b in corners[i + 1 :]:
            if sum(1 for u, v in zip(a, b) if u != v) == 1:
                segment(a, b, f"edge{k}")
                k += 1
    # Round joints at the corners, so the edges meet cleanly.
    for i, c in enumerate(corners):
        ball(c, R * 1.4, f"corner{i}")
    export("cube")


def spiral():
    """A rising spiral: two arms opening upward."""
    reset()
    turns = 2.0  # the generator's 2.75 packs the coils too close at 100 drones
    for s, off in enumerate((0, math.pi)):
        def f(t, off=off):
            a = t * TAU * turns + off
            rr = 0.2 + 0.72 * t
            return (math.cos(a) * rr, -0.6 + t * 1.2, math.sin(a) * rr)

        curve(f, 260, f"arm{s}")
    export("spiral")


def diamond():
    """A brilliant-cut diamond as its facet edges: table, crown, girdle and
    pavilion meeting at the culet."""
    reset()
    facets = 8
    girdle_r, girdle_y = 0.7, 0.18
    table_r, table_y = 0.34, 0.55
    tip = (0, -0.85, 0)

    def at(radius, y, i):
        a = i / facets * TAU
        return (math.cos(a) * radius, y, math.sin(a) * radius)

    tube([at(girdle_r, girdle_y, i) for i in range(facets)], "girdle", closed=True)
    tube([at(table_r, table_y, i) for i in range(facets)], "table", closed=True)
    for i in range(facets):
        segment(at(girdle_r, girdle_y, i), at(table_r, table_y, i), f"crown{i}")
        segment(at(girdle_r, girdle_y, i), tip, f"pavilion{i}")
    export("diamond")


def pyramid():
    """A square pyramid as its eight edges."""
    reset()
    half, base_y = 0.8, -0.6
    apex = (0, 0.85, 0)
    corners = [(-half, base_y, -half), (half, base_y, -half), (half, base_y, half), (-half, base_y, half)]
    for i in range(4):
        segment(corners[i], corners[(i + 1) % 4], f"base{i}")
        segment(corners[i], apex, f"ridge{i}")
    for i, c in enumerate(corners + [apex]):
        ball(c, R * 1.4, f"corner{i}")
    export("pyramid")


def starburst():
    """Rays of light in every direction from a small bright core."""
    reset()
    for i, (x, y, z) in enumerate(fibonacci(20)):
        segment((x * 0.22, y * 0.22, z * 0.22), (x, y, z), f"ray{i}")
    ball((0, 0, 0), 0.12, "core")
    export("starburst")


for make in (globe, helix, atom, knot, cube, spiral, diamond, pyramid, starburst):
    make()
