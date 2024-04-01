let temp1 = new cc.Vec3();
let temp2 = new cc.Vec3();
let temp3 = new cc.Vec3();
let r = new cc.Vec3();
let c0 = new cc.Vec3();
let c1 = new cc.Vec3();
let c2 = new cc.Vec3();
let c3 = new cc.Vec3();
let c4 = new cc.Vec3();
let c5 = new cc.Vec3();
let c6 = new cc.Vec3();
let c7 = new cc.Vec3();

class MeshPlane {
    public verts: number[] = [];
    public order: number[] = [];
    public normals: cc.Vec3[] = [];
    // public uvs: cc.Vec2[] = [];
}

interface MeshPoly {
    vert: cc.Vec2,
    normal: cc.Vec2,
    inner: cc.Vec2,
}

export class PrimitiveUtils {
    public static box(width = 1, height = 1, length = 1, segmentCount = 1) {
        let ws = segmentCount;
        let hs = segmentCount;
        let ls = segmentCount;
        let hw = width * 0.5;
        let hh = height * 0.5;
        let hl = length * 0.5;

        let corners = [
            cc.Vec3.set(c0, -hw, -hh,  hl),
            cc.Vec3.set(c1,  hw, -hh,  hl),
            cc.Vec3.set(c2,  hw,  hh,  hl),
            cc.Vec3.set(c3, -hw,  hh,  hl),
            cc.Vec3.set(c4,  hw, -hh, -hl),
            cc.Vec3.set(c5, -hw, -hh, -hl),
            cc.Vec3.set(c6, -hw,  hh, -hl),
            cc.Vec3.set(c7,  hw,  hh, -hl),
        ];

        let faceAxes = [
            [ 2, 3, 1 ], // FRONT
            [ 4, 5, 7 ], // BACK
            [ 7, 6, 2 ], // TOP
            [ 1, 0, 4 ], // BOTTOM
            [ 1, 4, 2 ], // RIGHT
            [ 5, 0, 6 ]  // LEFT
        ];
        
        let faceNormals = [
            [  0,  0,  1 ], // FRONT
            [  0,  0, -1 ], // BACK
            [  0,  1,  0 ], // TOP
            [  0, -1,  0 ], // BOTTOM
            [  1,  0,  0 ], // RIGHT
            [ -1,  0,  0 ]  // LEFT
        ];

        let positions: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];
        let indices: number[] = [];
        let minPos = new cc.Vec3(-hw, -hh, -hl);
        let maxPos = new cc.Vec3(hw, hh, hl);
        let boundingRadius = Math.sqrt(hw * hw + hh * hh + hl * hl);

        function _buildPlane (side, uSegments, vSegments) {
            let u, v;
            let ix, iy;
            let offset = positions.length / 3;
            let faceAxe = faceAxes[side];
            let faceNormal = faceNormals[side];

            for (iy = 0; iy <= vSegments; iy++) {
            for (ix = 0; ix <= uSegments; ix++) {
                u = ix / uSegments;
                v = iy / vSegments;

                cc.Vec3.lerp(temp1, corners[faceAxe[0]], corners[faceAxe[1]], u);
                cc.Vec3.lerp(temp2, corners[faceAxe[0]], corners[faceAxe[2]], v);
                cc.Vec3.subtract(temp3, temp2, corners[faceAxe[0]]);
                cc.Vec3.add(r, temp1, temp3);

                positions.push(r.x, r.y, r.z);
                normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                uvs.push(u, v);

                if ((ix < uSegments) && (iy < vSegments)) {
                let useg1 = uSegments + 1;
                let a = ix + iy * useg1;
                let b = ix + (iy + 1) * useg1;
                let c = (ix + 1) + (iy + 1) * useg1;
                let d = (ix + 1) + iy * useg1;

                indices.push(offset + a, offset + d, offset + b);
                indices.push(offset + b, offset + d, offset + c);
                }
            }
            }
        }

        _buildPlane(0, ws, hs); // FRONT
        _buildPlane(4, ls, hs); // RIGHT
        _buildPlane(1, ws, hs); // BACK
        _buildPlane(5, ls, hs); // LEFT
        _buildPlane(3, ws, ls); // BOTTOM
        _buildPlane(2, ws, ls); // TOP

        // return cc.primitive.VertexData(
        //     positions,
        //     normals,
        //     uvs,
        //     indices,
        //     minPos,
        //     maxPos,
        //     boundingRadius
        // );
        return {
            positions     : positions,
            normals       : normals,
            uvs           : uvs,
            indices       : indices,
            minPos        : minPos,
            maxPos        : maxPos,
            boundingRadius: boundingRadius,
        };
    }

    public static poly(polys: cc.Vec2[], roundness = 0.2, height = 1) {
        let meshPolys = this._smoothPoly(polys, roundness, 2);
        let polyLen = meshPolys.length;

        /** 顶点 */
        let corners0 = [];
        let corners1 = [];
        for(let meshPoly of meshPolys) {
            corners0.push(cc.v3(meshPoly.vert.x, meshPoly.vert.y, +height/2));
            corners1.push(cc.v3(meshPoly.vert.x, meshPoly.vert.y, -height/2));
        }
        let corners: cc.Vec3[] = corners0.concat(corners1);

        /** 上下两个面 */
        let planes: MeshPlane[] = [
            new MeshPlane(),
            new MeshPlane(),
        ];
        for(let i = 0; i < polyLen; i++) {
            planes[0].verts.push(i);
            planes[1].verts.push(i + polyLen);

            if (i == 0) {
                planes[0].order.push(0);
                planes[1].order.push(polyLen);
            } else {
                planes[0].order.push(i);
                planes[1].order.push(polyLen - i + polyLen);
            }

            planes[0].normals.push(cc.v3(0, 0, 1));
            planes[1].normals.push(cc.v3(0, 0, -1));

            /** 法线 - 圆角 */
            // planes[0].normals.push(cc.v3(meshPolys[i].normal.x, meshPolys[i].normal.y, 0));
            // planes[1].normals.push(cc.v3(meshPolys[i].normal.x, meshPolys[i].normal.y, 0));
        };

        /** 其他面 */
        for(let i = 0; i < polyLen; i++) {
            let ci0 = i;
            let ci1 = (i + 1) % polyLen;
            let ci2 = ci0 + polyLen;
            let ci3 = ci1 + polyLen;
            let offset = corners.length;

            corners.push(corners[ci0], corners[ci1], corners[ci2], corners[ci3]);
            let plane = new MeshPlane();
            plane.verts = [offset, offset + 1, offset + 2, offset + 3];
            plane.order = [offset, offset + 2, offset + 3, offset + 1];
            
            /** 法线 - 垂直面 */
            // let p0 = corners[plane.order[0]];
            // let p1 = corners[plane.order[1]];
            // let p2 = corners[plane.order[2]];
            // let vec0 = p0.sub(p1);
            // let vec1 = p2.sub(p1);
            // let normal = vec0.cross(vec1).normalize().negate();
            // plane.normals = [normal, normal, normal, normal];

            /** 法线 - 圆角 */
            plane.normals = [
                cc.v3(meshPolys[ci0].normal.x, meshPolys[ci0].normal.y, 0),
                cc.v3(meshPolys[ci1].normal.x, meshPolys[ci1].normal.y, 0),
                cc.v3(meshPolys[ci0].normal.x, meshPolys[ci0].normal.y, 0),
                cc.v3(meshPolys[ci1].normal.x, meshPolys[ci1].normal.y, 0),
            ];

            planes.push(plane);
        }

        /** 构建 */
        let positions: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];
        let indices: number[] = [];

        for(let pi = 0; pi < planes.length; pi++) {
            let plane = planes[pi];

            for(let vi = 0; vi < plane.verts.length; vi++) {
                let corner = corners[plane.verts[vi]];
                let normal = plane.normals[vi];
                let order = plane.order;

                positions.push(corner.x, corner.y, corner.z);
                uvs.push(0, 0);
                normals.push(normal.x, normal.y, normal.z);

                if (vi >= 2) {
                    let ci2 = order[vi];
                    let ci1 = order[vi - 1];
                    let ci0 = order[0];
                    indices.push(ci0, ci1, ci2);
                }
            }
        }

        return {
            positions     : positions,
            normals       : normals,
            uvs           : uvs,
            indices       : indices,
        };
    }

    public static poly2(polys: cc.Vec2[]) {
        // let meshPolys = this._smoothPoly(polys, 0.02, 1);
        // let polyLen = meshPolys.length;

        // /** 顶点 */
        // let corners: cc.Vec3[] = [];
        // for(let meshPoly of meshPolys) {
        //     corners.push(cc.v3(meshPoly.vert.x, meshPoly.vert.y));
        // }

        /** 顶点 */
        let corners: cc.Vec3[] = [];
        for(let poly of polys) {
            corners.push(cc.v3(poly.x, poly.y));
        }
        let polyLen = polys.length;

        /** 面 */
        let planes: MeshPlane[] = [
            new MeshPlane(),
        ];
        for(let i = 0; i < polyLen; i++) {
            planes[0].verts.push(i);
            planes[0].order.push(i);
            planes[0].normals.push(cc.v3(0, 0, 1));
        };

        /** 构建 */
        let positions: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];
        let indices: number[] = [];
        for(let pi = 0; pi < planes.length; pi++) {
            let plane = planes[pi];

            for(let vi = 0; vi < plane.verts.length; vi++) {
                let corner = corners[plane.verts[vi]];
                let normal = plane.normals[vi];
                let order = plane.order;

                positions.push(corner.x, corner.y, corner.z);
                uvs.push(0, 0);
                normals.push(normal.x, normal.y, normal.z);

                if (vi >= 2) {
                    let ci2 = order[vi];
                    let ci1 = order[vi - 1];
                    let ci0 = order[0];
                    indices.push(ci0, ci1, ci2);
                }
            }
        }

        return {
            positions     : positions,
            normals       : normals,
            uvs           : uvs,
            indices       : indices,
        };
    }

    public static newMesh(indices, verts, uv, normals): cc.Mesh {
        let gfx = cc.gfx;
        let mesh = new cc.Mesh();

        var vfmtMesh = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
        ]);
        vfmtMesh.name = 'vfmtPosUvNormal';

		mesh.init(vfmtMesh, verts.length);
        mesh.setIndices(indices, 0);
		mesh.setVertices(gfx.ATTR_POSITION, verts);
        mesh.setVertices(gfx.ATTR_UV0, uv);
        mesh.setVertices(gfx.ATTR_NORMAL, normals);
		mesh.setPrimitiveType(gfx.PT_TRIANGLES, 0);
        return mesh;
    }

    //================================================ utils
    private static _smoothPoly(polys: cc.Vec2[], roundness: number, count: number): MeshPoly[] {
        let verts: MeshPoly[] = [];

        let trail = [];
        for(let i = 0, len = polys.length; i < len; i++) {
            let p0 = polys[i];
            let pu = polys[(i + 1) % len];
            let pv = polys[(i - 1 + len) % len];
            let vu = pu.sub(p0).normalize();
            let vv = pv.sub(p0).normalize();
            let radian = vv.angle(vu) / 2;
            let dis = roundness / Math.cos(radian);
            let radius = dis * Math.sin(radian);
            let vin = vu.add(vv).normalize();
            let vi = vin.mul(dis);
            let pi = p0.add(vi);

            let u = vu.mul(vi.dot(vu));
            let v = vv.mul(vi.dot(vv));
            let seg0: MeshPoly[] = [];
            let seg1: MeshPoly[] = [];
            for(let ic = 1; ic <= count; ic++) {
                let ps0 = p0.lerp(p0.add(u), ic/count);
                let ps1 = p0.lerp(p0.add(v), ic/count);

                let normal0 = ps0.sub(pi).normalize();
                let normal1 = ps1.sub(pi).normalize();

                seg0.push({ vert: pi.add(normal0.mul(radius)), normal: normal0, inner: pi });
                seg1.push({ vert: pi.add(normal1.mul(radius)), normal: normal1, inner: pi });
            }
            /** prev */
            seg1.reverse();
            if (i == 0) {
                trail = seg1;
            } else {
                verts = verts.concat(seg1);
            }
            /** cuur */
            let normal = vin.neg();
            verts.push({ vert: pi.add(normal.mul(radius)), normal: normal, inner: pi });
            /** post */
            verts = verts.concat(seg0);
        }
        verts = verts.concat(trail);

        return verts;
    }
}