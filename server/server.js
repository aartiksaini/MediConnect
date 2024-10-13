import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import cors from 'cors'
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken';
import auth from './middlewares/auth.js'; // Correct import for ES module

import { Doctor, Interaction, Patient } from './db/model.js';


import axios from 'axios';
import {signupSchema , loginSchema ,chatSchema } from './zod.js';
const app = express();
app.use(cors());
app.use(bodyParser.json());





mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json(err.errors);
  }
};


const formatGeneratedText = (text) => {
  return text
    .replace(/##+/g, '') 
    .replace(/\*\*/g, '') 
    .replace(/\*/g, '') 
    .replace(/- /g, '- ') 
    .replace(/- /g, '\n- ')
    .replace(/(\d\.)/g, '\n$1')
    .replace(/(\d\.)/g, '\n$1') 
    .replace(/\n+/g, ' ') 
    .trim(); 
};

const generateContent = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.candidates[0].content.parts[0].text;
    return formatGeneratedText(text);
  } catch (error) {
    console.error("Error generating content:", error);
    return "";
  }
};


  const doctors = [

   
    { name: 'Dr. Garcia', specialization: 'Orthopedics' ,image:"https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Miller', specialization: 'Pediatrics' , image:"https://img.freepik.com/free-photo/portrait-professional-medical-worker-posing-picture-with-arms-folded_1098-19293.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Davis', specialization: 'Psychiatry' , image:"https://img.freepik.com/premium-photo/doctor-standing-crossed-arm-with-holding-blue-stethoscope-with-blurred-hospital-background_1254992-43101.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Nisha', specialization: 'Radiology' , image:"https://img.freepik.com/free-photo/cinematic-portrait-woman-working-healthcare-system-having-care-job_23-2151237523.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Martinez', specialization: 'Gastroenterology' , image:"https://img.freepik.com/premium-photo/portrait-smiling-doctor-with-stethoscope-corridor-hospital_948103-151.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Kushi', specialization: 'Urology' , image:"https://img.freepik.com/free-photo/expressive-young-woman-posing-studio_176474-66963.jpg?w=740&t=st=1721050235~exp=1721050835~hmac=1eddf0269cab9419977812a7990e879333c04f2b63b674454d27015782dcc995"},
    { name: 'Dr. Kirat', specialization: 'Oncology' ,image:"https://img.freepik.com/premium-photo/young-hispanic-man-shrugging-feeling-confused-uncertain-doctor-syringe-concept_1194-284900.jpg?size=626&ext=jpg"},
    { name: 'Dr. Verma', specialization: 'Gynecology' , image:"https://thumbs.dreamstime.com/b/young-doctor-16088825.jpg" },
    { name: 'Dr. Wilson', specialization: 'Endocrinology'  , image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4UQ8829KMn7WlvyQsnO9ieR2B-uRRVkZbSw&s"},
    { name: 'Dr. Smith', specialization: 'Skin' , image:"https://media.istockphoto.com/id/1298800629/photo/portrait-of-confident-male-doctor-looking-at-camera.jpg?s=2048x2048&w=is&k=20&c=nSjOQrrbcf6w00lZk7Owo5WfHdMu_WEGuZUh119U4jA=" },
    { name: 'Dr. Janvi', specialization: 'Hair' , image:"https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Williams', specialization: 'Dental' , image:"https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Brown', specialization: 'Cardiology' , image:"https://img.freepik.com/premium-photo/doctor-portrait_1108314-280707.jpg?size=626&ext=jpg&ga=GA1.1.493883763.1720994992&semt=sph" },
    { name: 'Dr. Verma', specialization: 'Gynecology' , image:"https://thumbs.dreamstime.com/b/young-doctor-16088825.jpg" },
  ];

  await Doctor.insertMany(doctors);
  console.log('Dummy doctors inserted');

const saveInteraction = async (patientId, doctorId, query, response) => {
  const interaction = new Interaction({
    patientId,
    doctorId,
    query,
    response,
    interactionDate: new Date(),
  });
  await interaction.save();
};

const doctor = [
  { name: 'Dr. Smith', specialization: 'Skin' },
  { name: 'Dr. Janvi', specialization: 'Hair' },
  { name: 'Dr. Williams', specialization: 'Dental' },
  { name: 'Dr. Brown', specialization: 'Cardiology' },
  { name: 'Dr. Sherya', specialization: 'Neurology' },
  { name: 'Dr. Garcia', specialization: 'Orthopedics' },
  { name: 'Dr. Miller', specialization: 'Pediatrics' },
  { name: 'Dr. Davis', specialization: 'Psychiatry' },
  { name: 'Dr. Nisha', specialization: 'Radiology' },
  { name: 'Dr. Martinez', specialization: 'Gastroenterology' },
  { name: 'Dr. Kushi', specialization: 'Urology' },
  { name: 'Dr. Kirat', specialization: 'Oncology' },
  { name: 'Dr. Verma', specialization: 'Gynecology' },
  { name: 'Dr. Wilson', specialization: 'Endocrinology' },
];

const specializations = [...new Set(doctor.map(doctor => doctor.specialization))];

app.get('/specializations', (req, res) => {
  res.json(specializations);
});

app.post('/signup', validate(signupSchema), async (req, res) => {
    const { name, email, password, age, gender } = req.body;
    try {
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const patient = new Patient({ name, email, password: hashedPassword, age, gender });
        await patient.save();
        const token = jwt.sign({ id: patient._id },procee.env.JWT_SECRET);
        res.json({ token, email });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up', error });
    }
});


app.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET);
        res.json({ token, email });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});


app.get('/profile', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient.id).select('-password');
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});


app.get('/doctordetails', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/doctordetails/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    console.log(doctor)
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/interactions/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const userId = req.patient.id;
    const conversations = await Interaction.find({ doctorId, patientId: userId });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/interactions', auth, async (req, res) => {
  try {
    const interactions = await Interaction.find({ patientId: req.patient.id }).populate('doctorId');
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interactions', error });
  }
});

app.post('/chat',validate(chatSchema), auth, async (req, res) => {
  const { specialization, query, doctorId } = req.body;
  
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.specialization !== specialization) {
      return res.status(404).json({ message: 'Doctor not found or specialization does not match' });
    }

    const response = await generateContent(query);
    if (response !== "") {
      await saveInteraction(req.patient.id, doctor._id, query, response);
    }
    res.json({ response });
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).send('Error handling chat');
  }
});
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
