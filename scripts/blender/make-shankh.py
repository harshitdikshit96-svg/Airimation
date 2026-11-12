# Airimation's own 3D model of the shankh: the sacred chank, Turbinella
# pyrum, as blown in puja. Made by script in Blender (free), so it is ours
# outright and can be regenerated or tweaked. (The CC BY "conch" we had
# before was a featureless teardrop.)
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python scripts/blender/make-shankh.py -- ../Scans/made
#
# Writes <out>/shankh.glb. Then convert with scripts/scan-to-formation.mjs
# (no --rotate needed; licence: Airimation's own).
#
# The shell stands upright: spire (apex) at the top, siphonal canal at the
# bottom, aperture facing the audience (Blender -Y = glTF +Z). It is coiled
# dextral (aperture on the viewer's right), like nearly every real chank.
#
# How it is built: the outer surface is r(phi, z) around the Z axis. The
# whorls are a logarithmic spiral: a point's whorl coordinate is
#   s = ln(d / D) / ln(Q) + phi' / 2pi     (d = distance below the apex)
# and the sutures are where s is a whole number, so they wind down the
# spire as a true helix, each whorl Q times taller than the one above.
# Each spire whorl is a tier: sloping out to a shoulder, then tucked in
# sharply to the suture (a stepped silhouette). With CORDS = "spire" only
# the shoulder-and-ledge band of each tier (plus a thin mid cord) is kept,
# so drones line up along the coil. Below the last suture is the big body
# whorl, its shoulder, then the long tapering siphonal canal. The aperture
# is cut out of the front as a real opening onto a recessed pink lining,
# edged by a thick flared outer lip, with the chank's three columella folds
# (plicae). Materials carry the colours for scripts/scan-colors.mjs:
# ivory shell, amber-brown sutures, peach-pink aperture.
#
# Converter note: keep the mesh free of zero-area triangles (rings of
# coincident vertices). scan-to-formation.mjs weights a zero-area triangle
# as area 0.5 (`hypot(n) || 1`), which swamps the sampling.
#
# Units are arbitrary (the converter normalises height): the shell is 1
# tall, canal tip at z = 0, apex at z = 1. Y is up in the exported GLB
# (Blender's Z-up is converted by the glTF exporter).

import bpy
import bmesh
import math
import os
import sys

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "made")
os.makedirs(OUT, exist_ok=True)

TAU = 2 * math.pi
Q = 1.7  # each whorl is this many times taller than the one above it
D = 0.42  # depth of the last (body-whorl) suture below the apex, at the lip
CONE = 0.55  # spire half-width per unit depth (a broad, chank-like cone)
NOTCH = 0.5  # how deep the sutures cut, as a fraction of the radius
CORDS = "spire"  # spiral bands, not a solid skin: "spire", "all" or None
WIDE = 1.05  # the body whorl swells this much past the spire's cone
BODY_CORDS = 9  # spiral cords on the body whorl, shoulder to canal tip
CORD_WIDTH = 0.3  # fraction of each cord pitch kept
PHI_A = math.radians(-45)  # azimuth where the body suture meets the lip
Z_TOP = 1 - D  # top of the aperture (the posterior notch, at the suture)
Z_BOT = 0.035  # bottom of the canal's open groove


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


def tube3(points, radius, name, radii=None):
    """A round tube along a 3D polyline (optional per-point radius scale)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for i, p in enumerate(points):
        sp.points[i].co = (*p, 1)
        if radii:
            sp.points[i].radius = radii[i]
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    return to_mesh(ob)


def smooth(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def interp(table, x):
    """Piecewise-linear lookup in a sorted [(x, y)] table."""
    if x <= table[0][0]:
        return table[0][1]
    for (x0, y0), (x1, y1) in zip(table, table[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return table[-1][1]


# Body whorl below the shoulder, as a fraction of the shoulder radius,
# against the fraction of the way from the shoulder down to the canal tip:
# a fat rounded body, then the long tapering siphonal canal.
BODY = [(0.0, 1.0), (0.1, 1.0), (0.2, 0.97), (0.3, 0.9), (0.38, 0.78), (0.45, 0.6), (0.52, 0.43), (0.6, 0.32), (0.7, 0.25), (0.8, 0.2), (0.9, 0.15), (1.0, 0.09)]


# The opening, as (fraction of the way from the canal groove's bottom to
# the posterior notch, left edge, right edge) in degrees of azimuth (-90 is
# the audience). The right edge is the outer lip; the left the columella.
APERTURE = [
    (0.0, -96, -84),
    (0.2, -100, -74),
    (0.35, -104, -52),
    (0.5, -106, -32),
    (0.65, -104, -21),
    (0.8, -96, -22),
    (0.92, -78, -32),
    (1.0, -45, -45),
]


def aperture(z):
    """(left, right) azimuths of the opening at height z, or None."""
    if z < Z_BOT or z > Z_TOP:
        return None
    v = (z - Z_BOT) / (Z_TOP - Z_BOT)
    left = interp([(a, b) for a, b, _ in APERTURE], v)
    right = interp([(a, c) for a, _, c in APERTURE], v)
    return math.radians(left), math.radians(right)


def seam(z):
    """Where growth stops: the outer lip. The whorl spiral is measured from
    here, so the step from one whorl to the next hides in the opening."""
    a = aperture(min(Z_TOP, max(Z_BOT, z)))
    return a[1] if a else PHI_A


def unwrap(phi, z):
    """Azimuth measured on round from the lip, in [0, 2pi)."""
    return (phi - seam(z)) % TAU


def whorl_s(z, phi):
    d = max(1e-6, 1 - z)
    return math.log(d / D) / math.log(Q) + unwrap(phi, z) / TAU


def bulge(t):
    """One whorl's cross-section between its sutures (t: 0 top, 1 bottom):
    convex, fullest a little below the middle, cut deep at both sutures."""
    t = min(1.0, max(0.0, t))
    return 1 - NOTCH * (1 - math.sin(math.pi * t) ** 0.5)


def tier(t):
    """A spire whorl as the chank shows it: sloping down and out to a
    shoulder, then tucked in sharply to the suture below. The tucked-in
    underside is a narrow ledge that drones trace as a spiral line."""
    t = min(1.0, max(0.0, t))
    if t < 0.8:
        return 1 - NOTCH * (1 - (t / 0.8) ** 0.7)
    return 1 - NOTCH * ((t - 0.8) / 0.2) ** 1.6


def radius(z, phi):
    s = whorl_s(z, phi)
    if s < 0:  # the spire
        return CONE * (1 - z) * tier(s - math.floor(s))
    if s < 0.5:  # the top half of the body whorl, up to its shoulder
        return CONE * (1 - z) * bulge(s) * (1 + (WIDE - 1) * smooth(0.0, 0.5, s))
    # Below the shoulder. The shoulder is lower and wider toward the lip
    # (the body whorl keeps growing); lower down, the canal is round.
    f = Q ** (-unwrap(phi, z) / TAU)
    d = D * math.sqrt(Q) * f
    zs, rs = 1 - d, CONE * WIDE * d
    x = (zs - z) / zs
    mean = CONE * WIDE * D * math.sqrt(Q) * 0.8
    rs = rs + (mean - rs) * smooth(0.0, 0.55, x)
    return rs * interp(BODY, x)


def in_aperture(z, phi):
    a = aperture(z)
    if not a:
        return False
    left, right = a
    return 0 < (phi - left) % TAU < (right - left) % TAU


def point(z, phi, scale=1.0):
    r = radius(z, phi) * scale
    return (r * math.cos(phi), r * math.sin(phi), z)


# Colours, read by scripts/scan-colors.mjs (base colour factors): the
# chank's ivory, the warm shadow of its sutures, the peach-pink inside.
COLOURS = {"ivory": (0.93, 0.89, 0.80), "suture": (0.50, 0.30, 0.08), "pink": (0.95, 0.38, 0.36)}


def material(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*COLOURS[name], 1)
    return m


def link(bm, name, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    for m in mats:
        me.materials.append(material(m))
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def in_suture(z, phi):
    """The deep cut between two whorls (spire and body-whorl top)."""
    s = whorl_s(z, phi)
    t = s - math.floor(s)
    # (Not the last few whorls at the tip: too fine to show.)
    return s < 0.5 and 1 - z > 0.07 and (t > 0.8 or t < 0.08)


def in_gap(z, phi):
    """CORDS style: keep only spiral bands of the surface. Each spire whorl
    keeps its shoulder and the tucked-in ledge below it; the body whorl keeps
    a run of spiral cords down to the canal. Drones then line up along the
    coil, and the gaps between read as the spiral."""
    if not CORDS or 1 - z < 0.03:
        return False
    s = whorl_s(z, phi)
    if CORDS == "spire" and s >= 0:
        return False
    if s < 0:
        t = s - math.floor(s)
        return not (t > 0.66 or 0.30 < t < 0.38)
    if s < 0.5:
        return not (s > 0.36 or s < 0.08)
    d = D * math.sqrt(Q) * Q ** (-unwrap(phi, z) / TAU)
    x = (1 - d - z) / (1 - d)
    return (x * BODY_CORDS) % 1 > CORD_WIDTH


def shell():
    """The outer surface, with the aperture cut out; sutures coloured."""
    seg, rows = 200, 420
    bm = bmesh.new()
    # Rows denser toward the apex; the apex itself is one vertex (a ring of
    # coincident vertices would make zero-area triangles, which the
    # converter's area weighting does not expect).
    zs = [1 - (1 - k / rows) ** 1.5 for k in range(rows)]
    grid = []
    for z in zs:
        grid.append([bm.verts.new(point(z, TAU * k / seg)) for k in range(seg)])
    for j in range(rows - 1):
        for k in range(seg):
            zc, pc = (zs[j] + zs[j + 1]) / 2, TAU * (k + 0.5) / seg
            if in_aperture(zc, pc):
                continue
            a, b = grid[j], grid[j + 1]
            if in_gap(zc, pc):
                continue
            f = bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
            f.material_index = 1 if in_suture(zc, pc) else 0
    apex = bm.verts.new((0, 0, 1))
    for k in range(seg):
        bm.faces.new((grid[-1][k], grid[-1][(k + 1) % seg], apex))
    # The canal tip: close it with a small cap.
    tip = bm.verts.new((0, 0, -0.004))
    for k in range(seg):
        if not in_aperture(zs[0] + 1e-4, TAU * (k + 0.5) / seg):
            bm.faces.new((tip, grid[0][(k + 1) % seg], grid[0][k]))
    return link(bm, "shell", ["ivory", "suture"])


def lining():
    """The pink inside of the body whorl, seen through the opening: set back
    from the outer surface, so the aperture reads as a hollow."""
    n, m = 120, 24
    bm = bmesh.new()
    rows = []
    for i in range(n + 1):
        z = Z_BOT + (Z_TOP - Z_BOT) * 0.97 * i / n  # stop short of the notch, where the opening has no width
        lo, hi = aperture(z)
        r = 0.65 * min(radius(z, lo), radius(z, hi - 1e-3))
        rows.append([bm.verts.new((r * math.cos(lo + (hi - lo) * k / m), r * math.sin(lo + (hi - lo) * k / m), z)) for k in range(m + 1)])
    for a, b in zip(rows, rows[1:]):
        for k in range(m):
            bm.faces.new((a[k], a[k + 1], b[k + 1], b[k]))
    return link(bm, "lining", ["pink"])


def lips():
    """The thick, flared outer lip (viewer's right) and the columellar lip
    (left), traced round the opening, plus the chank's columella folds."""
    n = 90
    right, left = [], []
    for i in range(n + 1):
        z = Z_BOT + (Z_TOP - Z_BOT) * i / n
        a = aperture(z)
        if not a:
            continue
        lo, hi = a
        v = i / n
        flare = 1.0 + 0.26 * math.sin(math.pi * min(1.0, v * 1.15)) ** 1.5
        right.append(point(z, hi - 1e-3, flare))
        left.append(point(z, lo + 1e-3, 0.97))
    rim = left[::-1] + right  # top of left, down, round the canal, up the right
    rim = [point(Z_TOP + 0.004, PHI_A)] + rim[:] + [point(Z_TOP + 0.004, PHI_A)]
    tube3(rim, 0.024, "lip").data.materials.append(material("pink"))
    # Columella folds (plicae): three oblique ridges across the inner (left)
    # wall, from the columellar lip down into the hollow.
    for k, zf in enumerate((0.36, 0.43, 0.50)):
        lo, hi = aperture(zf)
        edge = point(zf, lo + 1e-3, 0.97)
        pin = lo + 0.3 * (hi - lo)
        r = 0.65 * radius(zf - 0.04, pin)
        inner = (r * math.cos(pin), r * math.sin(pin), zf - 0.04)
        tube3([edge, inner], 0.014, f"fold{k}").data.materials.append(material("ivory"))


def shankh():
    reset()
    shell()
    lining()
    lips()
    export("shankh")


shankh()
