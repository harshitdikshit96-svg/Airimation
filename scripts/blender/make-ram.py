# Airimation's own 3D models of the Ram Mandir, Ayodhya, and of Lord Ram
# standing with his bow. There is no open-licence model of either, so we
# model them by script in Blender (free), from general reference only
# (published dimensions and photographs; no model or illustration traced).
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python scripts/blender/make-ram.py -- ../Scans/made
#
# Writes <out>/ram-mandir.glb and ram.glb. Then convert each with
# scripts/scan-to-formation.mjs (licence: Airimation's own).
#
# Units are arbitrary (the converter normalises size). Y is up in the
# exported GLB (Blender's Z-up is converted by the glTF exporter); the
# front faces Blender -Y, which becomes +Z (toward the audience).
#
# Detail is pitched at 500-2,000 drones sampled over the surface: big
# masses and a clear silhouette, plus pillar and storey banding so the
# temple doesn't read as a blob. Small carving would only add noise.

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

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
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return bpy.context.view_layer.objects.active


def mesh_from(name, build):
    """Build a mesh vertex by vertex with bmesh (no operator state)."""
    bm = bmesh.new()
    build(bm)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def box(x0, x1, y0, y1, z0, z1, name="box", caps=True):
    """A box. caps=False leaves off top and bottom: a big hidden roof or
    floor would only soak up drones (sampling goes by surface area)."""
    def b(bm):
        v = [bm.verts.new((x, y, z)) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
        faces = [(0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
        if caps:
            faces += [(0, 1, 3, 2), (4, 6, 7, 5)]
        for f in faces:
            bm.faces.new([v[i] for i in f])
    return mesh_from(name, b)


def cylinder(x, y, z0, z1, r, name="cyl", seg=10):
    def b(bm):
        lo = [bm.verts.new((x + r * math.cos(2 * math.pi * k / seg), y + r * math.sin(2 * math.pi * k / seg), z0)) for k in range(seg)]
        hi = [bm.verts.new((x + r * math.cos(2 * math.pi * k / seg), y + r * math.sin(2 * math.pi * k / seg), z1)) for k in range(seg)]
        for k in range(seg):
            bm.faces.new((lo[k], lo[(k + 1) % seg], hi[(k + 1) % seg], hi[k]))
    return mesh_from(name, b)


def lathe(profile, name, cx=0.0, cy=0.0, segments=32, sx=1.0, sy=1.0, square=0.0):
    """Surface of revolution of an (r, z) profile about a vertical axis at
    (cx, cy). `square` > 0 pushes the section toward a square (a Nagara
    shikhara is square in plan with rounded offsets)."""
    def b(bm):
        rings = []
        for r, z in profile:
            ring = []
            for k in range(segments):
                u = 2 * math.pi * k / segments
                c, s = math.cos(u), math.sin(u)
                # Superellipse: |x|^n + |y|^n = 1 with n from 2 (round) up.
                n = 2 + 4 * square
                k_ = (abs(c) ** n + abs(s) ** n) ** (-1 / n)
                ring.append(bm.verts.new((cx + sx * r * k_ * c, cy + sy * r * k_ * s, z)))
            rings.append(ring)
        for a, b_ in zip(rings, rings[1:]):
            for k in range(segments):
                bm.faces.new((a[k], a[(k + 1) % segments], b_[(k + 1) % segments], b_[k]))
    return mesh_from(name, b)


def tube(points, radius, name, radii=None, res=3):
    """A round tube along a 3D polyline."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = res
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


# ---------------------------------------------------------------- Ram Mandir
#
# Reference (published by the Shri Ram Janmabhoomi Teerth Kshetra and widely
# reported): Nagara style, pink Bansi Paharpur sandstone, 380 ft east-west,
# 250 ft wide, 161 ft to the top of the main shikhara, three storeys of about
# 20 ft on a raised plinth reached by steps from the east. Five mandapas:
# Nritya and Rang on the axis, then the Gudh (Sabha) mandapa flanked by the
# Prarthana and Kirtan mandapas, then the garbhagriha under the shikhara.
#
# 1 unit = 10 ft. X runs east (-) to west (+), so the audience (looking along
# +Y from -Y) sees the north/south elevation: the long stepped silhouette.

PLINTH = 1.6  # top of the plinth
STOREY = 2.0


def colonnade(x0, x1, y0, y1, z0, z1, spacing=1.6, r=0.12):
    """Pillars round the perimeter of a rectangle, plus a cornice band at the
    top: the dot pattern reads as pillars and storeys, not a solid slab."""
    def run(a, b):
        n = max(1, round((b - a) / spacing))
        return [a + (b - a) * i / n for i in range(n + 1)]
    for x in run(x0, x1):
        cylinder(x, y0, z0, z1, r, "pillar")
        cylinder(x, y1, z0, z1, r, "pillar")
    for y in run(y0, y1)[1:-1]:
        cylinder(x0, y, z0, z1, r, "pillar")
        cylinder(x1, y, z0, z1, r, "pillar")
    cornice(x0, x1, y0, y1, z1, 0.3)


def cornice(x0, x1, y0, y1, z, h, w=0.35):
    """A projecting band round a rectangle (a frame, not a slab)."""
    box(x0 - w, x1 + w, y0 - w, y0 + w, z, z + h, "cornice")
    box(x0 - w, x1 + w, y1 - w, y1 + w, z, z + h, "cornice")
    box(x0 - w, x0 + w, y0 + w, y1 - w, z, z + h, "cornice")
    box(x1 - w, x1 + w, y0 + w, y1 - w, z, z + h, "cornice")


def kalash_finial(cx, cy, z, s, name="kalash"):
    """Amalaka-topped pot finial, `s` = scale."""
    return lathe(
        [(0.02 * s, z), (0.3 * s, z), (0.42 * s, z + 0.25 * s), (0.3 * s, z + 0.5 * s), (0.12 * s, z + 0.6 * s), (0.16 * s, z + 0.7 * s), (0.02 * s, z + 1.0 * s)],
        name, cx, cy, segments=16,
    )


def samvarana(x0, x1, y0, y1, z0, height, tiers=5, name="roof"):
    """A mandapa roof: tiers stepping in like a pyramid, crowned by a bell
    (ghanta) and a kalash."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    hx, hy = (x1 - x0) / 2, (y1 - y0) / 2
    th = height * 0.62 / tiers
    for i in range(tiers):
        f = 1 - 0.68 * i / tiers
        z = z0 + i * th
        # Each tier: a sloped band (truncated pyramid).
        g = 1 - 0.68 * (i + 0.85) / tiers
        lathe([(f * 1.0, z), (g * 1.0, z + th)], f"{name}{i}", cx, cy, segments=4 * 6, sx=hx * 1.1, sy=hy * 1.1, square=1.0)
    zt = z0 + tiers * th
    rb = 0.32 * min(hx, hy)
    # Bell dome.
    lathe([(rb * 1.25, zt), (rb * 1.2, zt + 0.25 * rb), (rb * 0.95, zt + 0.7 * rb), (rb * 0.55, zt + 1.0 * rb), (rb * 0.2, zt + 1.15 * rb)], f"{name}bell", cx, cy, segments=24)
    kalash_finial(cx, cy, zt + 1.1 * rb, height * 0.22, f"{name}kalash")


def shikhara(cx, cy, z0, h, half, name="shikhara", finial=True, flag=False):
    """A Nagara curvilinear tower: square-ish plan, near-vertical at the foot
    and curving in toward the top, banded by bhumi-amalakas, crowned by the
    amalaka (ribbed disc) and kalash."""
    prof = []
    n = 18
    for i in range(n + 1):
        t = i / n
        r = half * (1 - 0.74 * t ** 1.5)
        z = z0 + h * t
        prof.append((r, z))
        if 0 < i < n and i % 3 == 0:  # a band: step out and back
            prof.append((r * 1.07, z + 0.01 * h))
            prof.append((r * 1.07, z + 0.035 * h))
            prof.append((r, z + 0.045 * h))
    lathe(prof, name, cx, cy, segments=32, square=0.6)
    if not finial:
        return
    rt = half * 0.3
    zt = z0 + h
    # Neck, then the amalaka: a wide, flat ribbed disc.
    lathe([(rt * 0.8, zt), (rt * 0.7, zt + 0.1 * half)], f"{name}neck", cx, cy, segments=24)
    za = zt + 0.1 * half
    am = half * 0.55
    lathe([(rt * 0.7, za), (am, za + 0.1 * am), (am * 1.05, za + 0.25 * am), (am, za + 0.4 * am), (rt * 0.7, za + 0.5 * am)], f"{name}amalaka", cx, cy, segments=32)
    zk = za + 0.5 * am
    kalash_finial(cx, cy, zk, half * 0.7, f"{name}kalash")
    if flag:
        ztop = zk + half * 0.7
        cylinder(cx, cy, zk, ztop + 1.6, 0.05, "flagpole", seg=6)
        # Saffron dhvaja: a pennant flying toward -X (east wind).
        def b(bm):
            a = bm.verts.new((cx, cy, ztop + 1.55))
            c = bm.verts.new((cx, cy, ztop + 0.75))
            t = bm.verts.new((cx - 1.6, cy, ztop + 1.05))
            bm.faces.new((a, t, c))
        mesh_from("flag", b)


def urushringa_cluster(cx, cy, z0, h, half):
    """The main shikhara with its smaller attached replicas (urushringas)
    climbing each face: the clustered, stepped silhouette of a Nagara
    tower."""
    shikhara(cx, cy, z0, h, half, "mulashikhara", flag=True)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        for k, (fh, fw, off) in enumerate(((0.62, 0.55, 0.62), (0.36, 0.42, 0.95))):
            shikhara(cx + dx * half * off, cy + dy * half * off, z0, h * fh, half * fw, f"uru{k}", finial=k == 0)


def ram_mandir():
    reset()
    # Plinth (adhishthana): two stepped mouldings over the footprint, with
    # the transepts of the side mandapas.
    box(-16.5, 19.5, -8.0, 8.0, 0, PLINTH * 0.55, "plinth", caps=False)
    box(-16.0, 19.0, -7.5, 7.5, PLINTH * 0.55, PLINTH, "plinth2", caps=False)
    box(-2.0, 6.0, -12.5, 12.5, 0, PLINTH, "plinthT", caps=False)
    # Steps rising from the east (-X) to the Singh Dwar.
    steps = 8
    for i in range(steps):
        box(-19.5 + i * 3.0 / steps, -16.5, -3.0, 3.0, 0, PLINTH * (i + 1) / steps, f"step{i}")
    # Elephant / lion balustrades flanking the stairs.
    for y in (-3.3, 3.3):
        tube([(-19.6, y, 0.6), (-16.6, y, PLINTH + 0.6)], 0.25, "rail")

    g, s1, s2 = PLINTH, PLINTH + STOREY, PLINTH + 2 * STOREY
    # Nritya mandapa (entrance): two storeys, open pillars.
    colonnade(-16.0, -10.5, -4.5, 4.5, g, s1)
    colonnade(-15.5, -11.0, -4.0, 4.0, s1, s2)
    samvarana(-15.5, -11.0, -4.0, 4.0, s2 + 0.3, 2.6, tiers=4, name="nritya")
    # Rang mandapa.
    colonnade(-10.0, -3.5, -5.5, 5.5, g, s1)
    colonnade(-9.6, -3.9, -5.0, 5.0, s1, s2)
    samvarana(-9.6, -3.9, -5.0, 5.0, s2 + 0.3, 3.2, tiers=5, name="rang")
    # Gudh (Sabha) mandapa: the largest hall, three storeys.
    colonnade(-3.0, 7.0, -7.0, 7.0, g, s1)
    colonnade(-2.6, 6.6, -6.5, 6.5, s1, s2)
    colonnade(-2.0, 6.0, -5.5, 5.5, s2, s2 + STOREY * 0.8)
    samvarana(-2.0, 6.0, -5.5, 5.5, s2 + STOREY * 0.8 + 0.3, 3.6, tiers=5, name="gudh")
    # Prarthana (south) and Kirtan (north) mandapas on the transept.
    for sgn, nm in ((-1, "prarthana"), (1, "kirtan")):
        y0, y1 = sorted((sgn * 7.4, sgn * 12.0))
        colonnade(-1.0, 5.0, y0, y1, g, s1)
        colonnade(-0.6, 4.6, y0 + 0.4, y1 - 0.4, s1, s2)
        samvarana(-0.6, 4.6, y0 + 0.4, y1 - 0.4, s2 + 0.3, 2.4, tiers=4, name=nm)
    # Garbhagriha (west): a solid sanctum, three storeys of wall with
    # cornices, under the main shikhara.
    box(7.5, 18.5, -5.5, 5.5, g, s2 + STOREY * 0.8, "garbhagriha", caps=False)
    for z in (s1, s2, s2 + STOREY * 0.8):
        cornice(7.5, 18.5, -5.5, 5.5, z - 0.15, 0.3, w=0.3)
    # Antarala: the vestibule joining hall and sanctum.
    box(7.0, 7.6, -3.5, 3.5, g, s2, "antarala", caps=False)
    # Main shikhara: 161 ft to the kalash.
    urushringa_cluster(13.0, 0.0, s2 + STOREY * 0.8 + 0.3, 7.6, 3.8)
    export("ram-mandir")


# ---------------------------------------------------------------- Lord Ram
#
# Standard iconography: standing upright, a tall crown (kirita mukut), a
# long bow (Kodanda) held vertically in the LEFT hand with its foot near
# the ground, an arrow in the RIGHT hand, a quiver of arrows on the back
# (feathers showing over the right shoulder), dhoti (pitambar) to the
# ankles, an angavastram (uttariya) round the arms, a halo. A smooth,
# stylised sculpted figure; the face is left plain.
#
# Body by metaballs (one smooth skin, no hidden inner surfaces to waste
# drones on); props by tubes and lathes. 1 unit ~ 1 head; ~8.6 units tall
# to the crown tip. Faces -Y; his left hand is at +X (the audience's right).

def meta_body():
    mb = bpy.data.metaballs.new("body")
    mb.resolution = 0.07
    mb.render_resolution = 0.07
    mb.threshold = 0.6
    ob = bpy.data.objects.new("body", mb)
    bpy.context.collection.objects.link(ob)

    def ball(p, r, s=(1, 1, 1)):
        e = mb.elements.new(type="ELLIPSOID")
        e.co = p
        e.radius = r
        e.size_x, e.size_y, e.size_z = s
        return e

    def capsule(a, b, r):
        a, b = Vector(a), Vector(b)
        d = b - a
        e = mb.elements.new(type="CAPSULE")
        e.co = (a + b) / 2
        e.radius = r
        e.size_x = d.length / 2
        e.rotation = Vector((1, 0, 0)).rotation_difference(d.normalized())
        return e

    # Head and neck.
    ball((0, 0, 7.35), 1.0, (0.36, 0.38, 0.46))
    capsule((0, 0.02, 6.7), (0, 0.02, 7.0), 0.24)
    # Chest, waist, hips (broad shoulders, narrow waist).
    ball((0, 0.05, 6.05), 1.0, (0.86, 0.42, 0.58))
    ball((0, 0.05, 5.25), 1.0, (0.55, 0.36, 0.5))
    ball((0, 0.05, 4.55), 1.0, (0.62, 0.4, 0.4))
    capsule((-0.85, 0.05, 6.35), (0.85, 0.05, 6.35), 0.32)  # shoulders
    # Right arm (-X): down, forearm forward, hand holding the arrow.
    capsule((-0.95, 0.05, 6.3), (-1.18, 0.0, 5.05), 0.22)
    capsule((-1.18, 0.0, 5.05), (-1.32, -0.35, 4.15), 0.18)
    ball((-1.34, -0.4, 4.0), 1.0, (0.16, 0.16, 0.2))
    # Left arm (+X): out to the bow, gripping it at waist height.
    capsule((0.95, 0.05, 6.3), (1.35, 0.0, 5.2), 0.22)
    capsule((1.35, 0.0, 5.2), (2.2, -0.2, 4.6), 0.18)
    ball((2.32, -0.22, 4.55), 1.0, (0.17, 0.17, 0.2))
    # Feet below the dhoti hem.
    ball((-0.3, -0.15, 0.12), 1.0, (0.17, 0.32, 0.13))
    ball((0.3, -0.15, 0.12), 1.0, (0.17, 0.32, 0.13))
    capsule((-0.28, 0.0, 0.2), (-0.28, 0.0, 0.7), 0.13)
    capsule((0.28, 0.0, 0.2), (0.28, 0.0, 0.7), 0.13)
    return to_mesh(ob)


def ram():
    reset()
    meta_body()
    # Dhoti (pitambar): from the waist, flaring a little to the ankles, with
    # a centre pleat falling in front.
    lathe(
        [(0.6, 4.75), (0.7, 4.3), (0.72, 3.6), (0.64, 2.6), (0.56, 1.5), (0.6, 0.85), (0.66, 0.65), (0.58, 0.6)],
        "dhoti", 0, 0.05, segments=36, sx=1.0, sy=0.58,
    )
    tube([(0, -0.42, 4.6), (0.03, -0.46, 3.0), (0, -0.5, 1.3), (0.03, -0.5, 0.65)], 0.07, "pleat")
    # Waist sash with hanging ends.
    lathe([(0.66, 4.62), (0.68, 4.8), (0.64, 4.92)], "sash", 0, 0.05, segments=36, sy=0.62)
    # Angavastram: over the shoulders and looping round the forearms, the
    # ends falling beside the dhoti.
    tube([(-1.25, -0.1, 4.9), (-1.35, -0.25, 4.0), (-1.3, -0.25, 3.0), (-1.18, -0.2, 2.3)], 0.07, "uttariyaR", radii=[1, 1, 1, 0.7])
    tube([(1.55, -0.1, 5.0), (1.45, -0.25, 4.0), (1.25, -0.25, 3.0), (1.1, -0.2, 2.3)], 0.07, "uttariyaL", radii=[1, 1, 1, 0.7])
    tube([(-0.9, -0.15, 6.4), (-0.5, -0.4, 5.6), (0, -0.45, 5.35), (0.5, -0.4, 5.6), (0.9, -0.15, 6.4)], 0.06, "uttariyaChest")
    # Necklace (vaijayanti mala) and a waist girdle.
    tube([(-0.55, -0.1, 6.55), (-0.4, -0.38, 5.9), (0, -0.46, 5.6), (0.4, -0.38, 5.9), (0.55, -0.1, 6.55)], 0.05, "mala")
    # Crown (kirita mukut): a tall tapering crown with a broad band and a
    # pointed top.
    lathe(
        [(0.0, 7.62), (0.38, 7.62), (0.42, 7.78), (0.4, 7.9), (0.34, 8.1), (0.28, 8.35), (0.22, 8.55), (0.25, 8.62), (0.12, 8.75), (0.05, 8.95), (0.0, 9.05)],
        "mukut", 0, 0, segments=24,
    )
    # Halo (prabhamandala) behind the head.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.85, minor_radius=0.05, major_segments=48, minor_segments=8, location=(0, 0.45, 7.55), rotation=(math.pi / 2, 0, 0))

    # The bow (Kodanda), held vertically in the left hand at (1.95, z 4.5):
    # a deep curved stave bowing outward, recurved tips, a straight string.
    gx, gz, half = 2.45, 4.55, 4.15
    pts = []
    n = 24
    for i in range(n + 1):
        t = -1 + 2 * i / n
        x = gx + 1.1 * (1 - t * t) - 1.1
        # Recurve: the tips flick back outward.
        x += 0.3 * max(0.0, abs(t) - 0.82) / 0.18
        pts.append((x, -0.22, gz + half * t))
    radii = [1.0 - 0.45 * abs(-1 + 2 * i / n) for i in range(n + 1)]
    tube(pts, 0.13, "bow", radii=radii)
    tip_lo, tip_hi = pts[0], pts[-1]
    tube([tip_lo, tip_hi], 0.04, "string")
    # Grip binding.
    tube([(gx, -0.22, gz - 0.25), (gx, -0.22, gz + 0.25)], 0.15, "grip")

    # The arrow in the right hand, held point-down beside the body.
    # It slants out and down from the hand so it can't be read as the arm.
    ay = -0.42
    top, tip = Vector((-0.95, ay, 6.1)), Vector((-2.05, ay, 1.5))
    u = (tip - top).normalized()
    tube([tuple(top), tuple(tip)], 0.05, "arrow")
    head = lathe([(0.0, 0.0), (0.2, 0.12), (0.0, 0.62)], "arrowhead", segments=12)
    head.location = tip
    head.rotation_mode = "QUATERNION"
    head.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(u)
    side_ = Vector((u.z, 0, -u.x))  # perpendicular, in the picture plane
    for sg in (-1, 1):
        def fl(bm, sg=sg):
            p = [top, top + side_ * sg * 0.22 - u * 0.12, top + side_ * sg * 0.22 + u * 0.5, top + u * 0.6]
            bm.faces.new([bm.verts.new(tuple(q)) for q in p])
        mesh_from("fletch", fl)

    # Quiver on the back, slung from the left hip to over the right
    # shoulder, its arrows' feathers showing above the shoulder.
    qa, qb = Vector((0.55, 0.62, 4.3)), Vector((-0.6, 0.62, 6.9))
    d = qb - qa
    q = lathe([(0.2, 0), (0.24, 0.15), (0.26, d.length)], "quiver", 0, 0, segments=16)
    q.location = qa
    q.rotation_mode = "QUATERNION"
    q.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    for k, off in enumerate((-0.12, 0.0, 0.12)):
        base = qb + Vector((off, 0, 0))
        top = qb + d.normalized() * 0.55 + Vector((off, 0, 0))
        tube([tuple(base), tuple(top)], 0.035, f"quiverArrow{k}")
        tube([tuple(top - d.normalized() * 0.25), tuple(top)], 0.09, f"quiverFeather{k}")
    export("ram")


for make in (ram_mandir, ram):
    make()
