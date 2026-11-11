import assert from 'node:assert/strict';
import {prepareAppointment,ratios} from '../src/appointment_workflow.js';

const calls:string[]=[];
const fake={smartCrop:async(image:string,aspect:string)=>{calls.push(`${image}:${aspect}`);return {url:`https://example.test/${aspect}`};}} as any;
const output=await prepareAppointment({patientId:'p1',patientName:'Ari',appointmentAt:'2026-10-01T09:30:00Z',avatarImage:'img'},fake);
assert.equal(output.variants.length,3);
assert.deepEqual(calls,ratios.map(r=>`img:${r}`));
assert.match(output.message,/Ari/);
console.log('appointment decision test passed');
