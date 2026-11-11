import {InfraiClient} from './infrai_client.js';
import {prepareAppointment} from './appointment_workflow.js';

const key=process.env.INFRAI_API_KEY;
if(!key) throw new Error('Set INFRAI_API_KEY before starting');
const avatarImage=process.env.INFRAI_AVATAR_IMAGE;
if(!avatarImage) throw new Error('Set INFRAI_AVATAR_IMAGE to base64-encoded image bytes before starting');
const client=new InfraiClient(key);
const result=await prepareAppointment({patientId:'p-104',patientName:'Mina Chen',appointmentAt:'2026-10-01T09:30:00Z',avatarImage},client);
console.log(JSON.stringify(result,null,2));
