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
# Solid, not wireframe (Nov 2026): every shape is a CLOSED SOLID — a cube
# has six faces, a pyramid four sides and a base, a globe is a whole sphere,
# lines are thick round tubes. The converter samples points by SURFACE AREA,
# so drones cover the faces evenly and the site's shading (by each point's
# normal) makes the faces read as a 3D object, not an outline.
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

# Default tube radius, in generator units (shapes are ~1.5-1.7 units tall):
# thick enough to read as a solid rod, not a line.
R = 0.07
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


def tube(points, name, radius=R, closed=False, taper=None):
    """A solid round tube along a 3D polyline of Y-up points. `taper` is a
    list of radius multipliers, one per point (a ray narrowing to a tip)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    cu.use_fill_caps = not closed
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for i, p in enumerate(points):
        sp.points[i].co = (*P(*p), 1)
        if taper:
            sp.points[i].radius = taper[i]
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
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=radius, location=P(*centre))
    bpy.context.object.name = name


def solid(verts, faces, name):
    """A closed polyhedron from Y-up vertices and faces (each listed
    counter-clockwise seen from outside)."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([P(*v) for v in verts], [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


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
    """A whole sphere — the globe as a solid ball of light."""
    reset()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.8, location=(0, 0, 0))
    bpy.context.object.name = "globe"
    export("globe")


def helix():
    """A DNA double helix: two thick strands, solid rungs, a bead where each
    rung meets a strand."""
    reset()
    turns, r, height = 1.6, 0.5, 1.8
    for s, off in enumerate((0, math.pi)):
        curve(lambda t, off=off: (math.cos(t * TAU * turns + off) * r, -height / 2 + t * height, math.sin(t * TAU * turns + off) * r), 240, f"strand{s}", radius=0.075)
    rungs = 8
    for i in range(rungs):
        t = (i + 0.5) / rungs
        a = t * TAU * turns
        y = -height / 2 + t * height
        p = (math.cos(a) * r, y, math.sin(a) * r)
        q = (-math.cos(a) * r, y, -math.sin(a) * r)
        segment(p, q, f"rung{i}", radius=0.045)
        ball(p, 0.1, f"bead{i}a")
        ball(q, 0.1, f"bead{i}b")
    export("helix")


def atom():
    """An atom: a nucleus of packed protons and neutrons, three solid orbit
    rings, and an electron on each."""
    reset()
    r = 0.78
    tilts = ((0, 0), (math.pi / 3, math.pi / 3), (-math.pi / 3, 2 * math.pi / 3))
    for k, (tx, sy) in enumerate(tilts):
        f = lambda t, tx=tx, sy=sy: rot_y(rot_x((math.cos(t * TAU) * r, math.sin(t * TAU) * r * 0.42, math.sin(t * TAU) * r), tx), sy)
        curve(f, 160, f"orbit{k}", radius=0.035, closed=True)
        ball(f(0.15 + k * 0.3), 0.075, f"electron{k}")
    # Nucleus: a tight cluster of 13 balls (one centre, twelve round it).
    ball((0, 0, 0), 0.1, "n0")
    for i, (x, y, z) in enumerate(fibonacci(12)):
        ball((x * 0.13, y * 0.13, z * 0.13), 0.09, f"n{i + 1}")
    export("atom")


def knot():
    """A (2, 3) torus knot: one thick solid rope, endlessly looping."""
    reset()
    p, q, r = 2, 3, 0.52

    def f(t):
        a = t * TAU
        rad = r * (2 + math.cos(q * a))
        return (rad * math.cos(p * a) / 2, r * math.sin(q * a) * 1.25, rad * math.sin(p * a) / 2)

    curve(f, 600, "knot", radius=0.085, closed=True)
    export("knot")


def cube():
    """A solid cube: six faces."""
    reset()
    bpy.ops.mesh.primitive_cube_add(size=1.4, location=(0, 0, 0))
    bpy.context.object.name = "cube"
    export("cube")


def spiral():
    """A rising spiral: two solid arms, thickening as they open upward."""
    reset()
    turns, n = 2.0, 260
    for s, off in enumerate((0, math.pi)):
        def f(t, off=off):
            a = t * TAU * turns + off
            rr = 0.2 + 0.72 * t
            return (math.cos(a) * rr, -0.6 + t * 1.2, math.sin(a) * rr)

        pts = [f(k / n) for k in range(n + 1)]
        tube(pts, f"arm{s}", radius=0.08, taper=[0.45 + 0.55 * k / n for k in range(n + 1)])
    export("spiral")


def diamond():
    """A solid brilliant-cut diamond: flat table, faceted crown, girdle, and
    a pavilion of facets meeting at the culet."""
    reset()
    facets = 8
    girdle_r, girdle_y = 0.7, 0.18
    table_r, table_y = 0.34, 0.55
    tip = (0, -0.85, 0)

    def at(radius, y, i, half=0.0):
        a = (i + half) / facets * TAU
        return (math.cos(a) * radius, y, math.sin(a) * radius)

    verts = [at(table_r, table_y, i) for i in range(facets)]  # 0..7 table
    verts += [at(girdle_r, girdle_y, i) for i in range(facets)]  # 8..15 girdle
    verts += [tip]  # 16 culet
    T, G, C = 0, facets, 2 * facets
    faces = [list(range(facets))[::-1]]  # the table, facing up
    for i in range(facets):
        j = (i + 1) % facets
        faces.append([T + i, T + j, G + j, G + i])  # crown facet
        faces.append([G + i, G + j, C])  # pavilion facet
    solid(verts, faces, "diamond")
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = bpy.data.objects["diamond"]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    export("diamond")


def pyramid():
    """A solid square pyramid: four triangular sides on a square base."""
    reset()
    half, base_y = 0.8, -0.6
    apex = (0, 0.85, 0)
    corners = [(-half, base_y, -half), (half, base_y, -half), (half, base_y, half), (-half, base_y, half)]
    faces = [[0, 1, 2, 3]] + [[i, (i + 1) % 4, 4] for i in range(4)]
    solid(corners + [apex], faces, "pyramid")
    bpy.context.view_layer.objects.active = bpy.data.objects["pyramid"]
    bpy.data.objects["pyramid"].select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    export("pyramid")


def starburst():
    """Solid rays of light bursting from a round core. Rays are even-width
    rods with rounded tips (a cone would put most of its surface, and so
    most drones, in a clump at the centre)."""
    reset()
    for i, (x, y, z) in enumerate(fibonacci(16)):
        pts = [(x * (0.2 + 0.8 * u), y * (0.2 + 0.8 * u), z * (0.2 + 0.8 * u)) for u in (k / 12 for k in range(13))]
        tube(pts, f"ray{i}", radius=0.05, taper=[1 - 0.35 * k / 12 for k in range(13)])
    ball((0, 0, 0), 0.17, "core")
    export("starburst")


for make in (globe, helix, atom, knot, cube, spiral, diamond, pyramid, starburst):
    make()
