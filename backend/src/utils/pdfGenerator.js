const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateTripPDF = (trip, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Pipe to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('MISSION ORDER', { align: 'center' })
        .moveDown();

      // Trip ID
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Order No: ${trip._id}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString('en-US')}`, { align: 'right' })
        .moveDown(2);

      // Driver Information
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('DRIVER INFORMATION')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Name: ${trip.driverId?.name || 'N/A'}`)
        .text(`Email: ${trip.driverId?.email || 'N/A'}`)
        .text(`Phone: ${trip.driverId?.phone || 'N/A'}`)
        .moveDown(1.5);

      // Trip Details
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('TRIP DETAILS')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Origin: ${trip.origin}`)
        .text(`Destination: ${trip.destination}`)
        .text(`Distance: ${trip.distance} km`)
        .text(`Status: ${trip.status.toUpperCase().replace('_', ' ')}`)
        .moveDown(1.5);

      // Vehicle Information
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('VEHICLE INFORMATION')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Truck: ${trip.truckId?.plateNumber || 'N/A'} - ${trip.truckId?.brand || ''} ${trip.truckId?.model || ''}`)
        .text(`Truck Mileage: ${trip.truckId?.mileage || 0} km`);

      if (trip.trailerId) {
        doc
          .text(`Trailer: ${trip.trailerId.plateNumber} (Capacity: ${trip.trailerId.capacity} kg)`)
          .text(`Trailer Mileage: ${trip.trailerId.mileage} km`);
      }

      doc.moveDown(1.5);

      // Mileage Information (if available)
      if (trip.mileageStart || trip.mileageEnd || trip.dieselVolume) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('MILEAGE & FUEL')
          .moveDown(0.5);

        doc.fontSize(11).font('Helvetica');

        if (trip.mileageStart) {
          doc.text(`Start Mileage: ${trip.mileageStart} km`);
        }
        if (trip.mileageEnd) {
          doc.text(`End Mileage: ${trip.mileageEnd} km`);
          if (trip.mileageStart) {
            doc.text(`Total Distance: ${trip.mileageEnd - trip.mileageStart} km`);
          }
        }
        if (trip.dieselVolume) {
          doc.text(`Diesel Consumed: ${trip.dieselVolume} L`);
        }

        doc.moveDown(1.5);
      }

      // Dates
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('SCHEDULE')
        .moveDown(0.5);

      doc.fontSize(11).font('Helvetica');

      if (trip.departureDate) {
        doc.text(`Departure: ${new Date(trip.departureDate).toLocaleString('en-US')}`);
      }
      if (trip.arrivalDate) {
        doc.text(`Arrival: ${new Date(trip.arrivalDate).toLocaleString('en-US')}`);
      }

      doc.moveDown(1.5);

      // Notes
      if (trip.notes) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('NOTES')
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .text(trip.notes)
          .moveDown(1.5);
      }

      // Signatures
      doc.moveDown(2);
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('_______________________', 100, doc.y)
        .text('_______________________', 350, doc.y - 15);

      doc
        .text('Driver Signature', 100, doc.y + 5)
        .text('Manager Signature', 350, doc.y - 10);

      // Footer
      doc
        .moveDown(2)
        .fontSize(9)
        .font('Helvetica')
        .text('RouteXpert Fleet Management System', { align: 'center' })
        .text('Generated on ' + new Date().toLocaleString('en-US'), { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTripPDF };