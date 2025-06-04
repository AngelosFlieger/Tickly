const express = require('express');
const moment = require('moment'); 
const router = express.Router();
const Event = require('./Event'); 
const Ticket = require('./Ticket'); 
const View = require('./View'); 
const User = require('./UserDetails');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

async function dynamicPricingJob() {
  console.log("🔄 Running dynamic pricing job:", new Date().toISOString());

  const weights = {
    time:    0.8,   // how much “closing soon” moves the price
    tickets: 0.6  ,   // how much “few seats left” moves the price
    demand:  0.6    // how much “lots of views” moves the price
  };
  const avgWeight = (weights.time + weights.tickets + weights.demand) / 3;

  const events = await Event.find({ status: 'running' });

  const now = Date.now();
  for (let ev of events) {
    try {
      const eventTs      = new Date(ev.date).getTime();
      const createdTs    = ev.createdAt.getTime();
      const totalWindow  = eventTs - createdTs;
      const timeRemaining= Math.max(0, eventTs - now);
      if (timeRemaining <= 0) continue;

      const timeFactor = Math.min(Math.max(timeRemaining / totalWindow, 0), 1);
      const availabilityFactor = Math.min(Math.max(1 - (ev.seats_left / ev.seat_num), 0), 1);

      const totalViews = await View.countDocuments({ eventID: ev._id });
      const viewThreshold = ev.seat_num *10;
      const demandFactor = Math.min(Math.max(totalViews / viewThreshold, 0), 1);

      const weightedSum =
        weights.time    * timeFactor +
        weights.tickets * availabilityFactor +
        weights.demand  * demandFactor;

      const priceAdj = weightedSum - avgWeight;

      let newPrice = ev.price * (1 + priceAdj);
      newPrice = Math.min(Math.max(newPrice, ev.price_min), ev.price_max);
      newPrice = Number(newPrice.toFixed(2));

      if(newPrice > ev.price*1.15){
        newPrice=ev.price*1.15;
      }else if(newPrice < ev.price*0.85){
        newPrice=ev.price*0.85;
      }

      newPrice = Number(newPrice.toFixed(2));

      if (Math.abs(newPrice - ev.price) > 0.01) {
        await Event.findByIdAndUpdate(ev._id, { price: newPrice });
        console.log(`  • ${ev._id}: ${ev.price} → ${newPrice}`);
      }
    } catch (err) {
      console.error("  ❌ Pricing error for", ev._id, err);
    }
  }
}

setInterval(dynamicPricingJob, 60 * 60 * 1000);

dynamicPricingJob();

router.get('/eventRoute', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

router.post('/trackView', async (req, res) => {
  try {
    const { eventID, userID } = req.body;

    if (!eventID || !userID) {
      return res.status(400).json({ error: 'Event ID and User ID are required' });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newView = new View({
      eventID,
      userID,
      gender: user.gender,
      city: user.city,
      view_time: new Date() 
    });

    await newView.save();

    res.status(201).json({ message: 'View recorded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error tracking view' });
  }
});

router.post('/trackView', async (req, res) => {
  try {
    const { eventID } = req.body;

    if (!eventID) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const formattedTime = moment().format('YYYY-MM-DD HH:mm');

    const newView = new View({ eventID, view_time: formattedTime });
    await newView.save();

    res.status(201).json({ message: 'View recorded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error tracking view' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/uploadImage', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image upload failed' });
  }

  const protocol = req.protocol;
  const host = req.get('host'); 
  const imagePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl: imagePath });

});


router.post('/eventRoute', async (req, res) => {
  try {
    const {
      title, description, imageUrl, location, city, type,
      price_min, price_max, price, seat_num, date, time, lat, lon
    } = req.body;

    if (!title || !description || !location || !city || !seat_num || !price || !price_min || !price_max || !date || !time || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const newEvent = new Event({
      title,
      description,
      imageUrl,
      location,
      city, 
      type,
      date,
      time,
      price_min,
      price_max,
      price,
      seat_num,
      seats_left: seat_num,
      ticket_sales_revenue: 0,
      status: "running",
      lat,
      lon
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully!", event: newEvent });

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: 'Error creating event' });
  }
});




router.delete('/eventRoute/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedEvent = await Event.findByIdAndDelete(id); 

    if (!deletedEvent) {
      return res.status(404).send({ message: 'Event not found' }); 
    }

    res.status(200).send({ message: 'Event deleted successfully' }); 
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error deleting event' }); 
  }
});

router.post('/bookTicket', async (req, res) => {
  try {
    const { email, eventID, quantity = 1, status = 'booked' } = req.body;

    if (!email || !eventID) {
      return res.status(400).json({ error: 'Email and Event ID are required' });
    }

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (event.seats_left < quantity) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    event.seats_left -= quantity;
    event.ticket_sales_revenue += event.price * quantity;
    await event.save();

    const newTicket = new Ticket({
      email,
      eventID,
      userGender: user.gender,
      userAge: user.age,
      userCity: user.city,
      quantity,
      status
    });

    await newTicket.save();

    console.log("🟢 Ticket booked successfully!", newTicket);
    res.status(201).json({ message: 'Ticket booked successfully!', ticket: newTicket });
    return;

  } catch (error) {
    console.error('❌ Error booking ticket:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error booking ticket' });
    }
  }
});

router.delete('/deleteTicketsByEvent/:eventID', async (req, res) => {
  try {
    const { eventID } = req.params;

    const deleted = await Ticket.deleteMany({ eventID });

    res.status(200).json({ message: 'Tickets deleted successfully', deletedCount: deleted.deletedCount });
  } catch (error) {
    console.error('❌ Error deleting tickets:', error);
    res.status(500).json({ error: 'Failed to delete tickets' });
  }
});

router.get('/getTickets', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const tickets = await Ticket.find({ email }).populate('eventID');

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/searchEvents', async (req, res) => {
  try {
      const { query } = req.query;

      if (!query) {
          return res.status(400).json({ error: 'Search query is required' });
      }

      const events = await Event.find({ title: { $regex: query, $options: 'i' } });

      res.status(200).json(events);
  } catch (error) {
      console.error('Error searching events:', error);
      res.status(500).json({ error: 'Error searching events' });
  }
});

router.get('/eventViews/:eventID', async (req, res) => {
  try {
    const { eventID } = req.params;
    const { filter } = req.query;

    const objectIdEventID = mongoose.Types.ObjectId.isValid(eventID)
      ? new mongoose.Types.ObjectId(eventID)
      : null;

    if (!objectIdEventID) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    let match = { eventID: objectIdEventID };
    let format = '%Y-%m-%d';

    if (filter === 'day') {
      format = '%H:00';
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      match.view_time = { $gte: startDate };
    } else if (filter === 'week') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      match.view_time = { $gte: startDate };
    } else if (filter === 'month') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      match.view_time = { $gte: startDate };
    }

    const views = await View.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$view_time" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ views });
  } catch (error) {
    console.error("❌ Error fetching event views:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/eventSales/:eventID', async (req, res) => {
  try {
    const { eventID } = req.params;
    const filter = req.query.filter || null;

    const objectIdEventID = mongoose.Types.ObjectId.isValid(eventID)
      ? new mongoose.Types.ObjectId(eventID)
      : null;

    if (!objectIdEventID) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    let sales = [];
    let tickets = [];

    if (filter) {
      let format = '';
      let startDate = new Date();

      if (filter === 'day') {
        format = '%H:00';
        startDate.setHours(0, 0, 0, 0);
      } else if (filter === 'week') {
        format = '%Y-%m-%d';
        startDate.setDate(startDate.getDate() - 7);
      } else if (filter === 'month') {
        format = '%Y-%m-%d';
        startDate.setDate(startDate.getDate() - 30);
      }

      sales = await Ticket.aggregate([
        {
          $match: {
            eventID: objectIdEventID,
            booking_date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: format, date: "$booking_date" } },
            count: { $sum: "$quantity" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      tickets = await Ticket.find({
        eventID: objectIdEventID,
        booking_date: { $gte: startDate }
      });
    } else {
      tickets = await Ticket.find({ eventID: objectIdEventID });
    }

    res.status(200).json({ sales, tickets });
  } catch (error) {
    console.error('❌ Error fetching event sales:', error);
    res.status(500).json({ error: error.message });
  }
});


router.put('/eventRoute/:id', async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.patch('/eventRoute/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status: 'finished' },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event status updated to finished', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ error: 'Failed to update event status' });
  } 
});

router.delete('/deleteUser/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;