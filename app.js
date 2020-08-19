var express = require("express");
var axios=require("axios");
var fs = require("fs");
var stripe =require("stripe")('sk_test_51Dxw3uDbxqoat6FAhktHiZlG0xc5MjgIJU0tBaZKbLYP4DAGwtBxNJlo8igG5jawQacvXM1mykLNArywGuaiwIIH00wQjKEJBZ');
var app = express();
var FIREBASEURL = `https://parkme-88c9c.firebaseio.com/`;
const body_parser = require('body-parser');
app.use(body_parser.urlencoded({
  extended: true
}));
app.use(body_parser.json());
app.post("/Compeletepaywithstripe",(req,res,next)=>{
	console.log(req.body.amount);
	stripe.charges.create({
		amount:req.body.amount,
		currency:req.body.currency,
		source:'tok_mastercard'
	}).then(resp=>{
		console.log(resp);
		res.send(resp);
		res.end();

	}).catch(err=>{
		res.send(err.response);
		console.log(err);
	})
})
let datetime={}
app.post("/Check_available_dates",async (req, res, next) => {
const resps=await performcheck(req.body.data).then((reps)=>{
	setTimeout(async()=>{
		console.log(reps);
		const validation=await validate_dates(reps,req.body.data);
		res.send(validation);
		res.end();
	},3000)
})
})

async function performcheck (data) 
{
return new Promise ((resolve,reject)=>{
	var arr=[];
    var i=0;
	var back_data=[];
	var errors=[];
	Object.entries(data.slots).map((slot,key)=>{
		arr[i]=slot[1].id;
		i++;
	})
	for(var k=0;k<arr.length;k++)
	{
	axios.get(FIREBASEURL+`/Slots_reservations/`+arr[k]+'/'+data.date+'.json').then(response=>{
		//console.log(response.data);
		back_data.push(response.data)
		//resolve(res.json(response.data));
	}).catch(err=>{
		console.log(err);
		errors.push(err);
	 //resolve(res.json(err));
	})
}
let response={
	data:back_data,
	error:errors
}
resolve(response);
})
}
function create_times(date,time1,time2)
{
	return new Promise(resolve=>{
	let time_ret1= new Date(date+' '+time1);
	let time_ret2=new Date(date+' '+time2);
	resolve( {start_time:time_ret1,
		end_time:time_ret2});
		})
}
async function validate_dates(data_old,data_curr)
{
	const perform=()=>{
		return new Promise(resolve=>{
		var i;
		data_of_empty_slots=[];
		let start2=new Date(data_curr.date+' '+data_curr.time_start);
		let end2=new Date(data_curr.date+' '+data_curr.time_end);

		console.log(data_old.data);
		for(i=0;i<data_old.data.length;i++)
		{
			if(data_old.data[i]!==null)
			{
				Object.entries(data_old.data[i]).map((entry,key)=>{
					create_times(data_curr.date,entry[1].start_time,entry[1].end_time).then(resp_end=>{
						console.log(resp_end,start2);
						if(resp_end.start_time>start2&&resp_end.start_time<end2||resp_end.end_time<start2&&resp_end.end_time<end2)
						{

						}else {
							data_of_empty_slots.push(entry[1].slot_id);
							console.log(data_of_empty_slots);
						}
					})
					// console.log(entry[1].start_time);
				})
			}
		}
		resolve(data_of_empty_slots);
		})
	}
	const results=await perform();
	console.log(results);
		return results;
}
app.listen(3000, () => {
 console.log("Server running on port 3000");
});