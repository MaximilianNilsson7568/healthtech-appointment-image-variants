import {z} from 'zod';
import {InfraiClient} from './infrai_client.js';

export const appointmentSchema=z.object({patientId:z.string().min(1), patientName:z.string().min(1), appointmentAt:z.string().datetime(), avatarImage:z.string().min(1)});
export type Appointment=z.infer<typeof appointmentSchema>;
export const ratios=['1:1','4:3','16:9'] as const;

export async function prepareAppointment( raw:unknown, client:InfraiClient){
  const appointment=appointmentSchema.parse(raw);
  const variants=await Promise.all(ratios.map(async aspect=>({aspect,result:await client.smartCrop(appointment.avatarImage,aspect)})));
  const message=`Appointment reminder for ${appointment.patientName} at ${appointment.appointmentAt}`;
  return {patientId:appointment.patientId,message,variants};
}
