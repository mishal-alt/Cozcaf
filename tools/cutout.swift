// Removes the background from a dish photo using Apple Vision's foreground mask.
// Usage: swift tools/cutout.swift <in.png> <out.png>
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: cutout <in> <out>"); exit(2) }
let url = URL(fileURLWithPath: args[1])
let handler = VNImageRequestHandler(url: url)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { print("no subject: \(args[1])"); exit(1) }
let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false)
let ci = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let data = ctx.pngRepresentation(of: ci, format: .RGBA8, colorSpace: cs)!
try data.write(to: URL(fileURLWithPath: args[2]))
