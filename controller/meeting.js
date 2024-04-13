require('dotenv').config();
const User = require('../model/User');
const Meeting = require('../model/Meeting');
const MeetingDetail = require('../model/MeetingDetail');
const {Op} = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = process.env.TOKEN_SECRET_KEY;

const createSchedule = async(req, res, next)=>{
	try {
		const authorization=req.headers.authorization
		let token
		if(authorization!==null && authorization.startsWith("Bearer ")){
			token=authorization.substring(7)
		}else{
			const error=new Error("You need to login")
			error.statusCode=403
			throw error
		}
		const decoded=jwt.verify(token,key)
		const currentUser=await User.findOne({
			where:{
				id:decoded.userId
			}
		})
		if(!currentUser){
			const error=new Error(`User with ID ${decoded.userId} doesn't exist!`)
			error.statusCode=400
			throw error
		}
		//user selain teacher tidak bisa buat schedule
		if(currentUser.role!='Teacher'){
			const error=new Error('User is not a teacher!')
			error.statusCode=400
			throw error
		}

		//ambil input user
		const {
			name, description, place, datetime_start, datetime_end, duration_minute
		} = req.body;

		//check availability (jam segitu udh ada janji atau belum)
		const checkAvailable = await Meeting.findAll({
			where: {
				teacherId: currentUser.id,
				[Op.or]: [
					{
						[Op.and]: [
							{ datetime_end: { [Op.gte]: datetime_start } },
							{ datetime_end: { [Op.lte]: datetime_end } }
						]
					},
					{
						[Op.and]: [
							{ datetime_start: { [Op.gte]: datetime_start } },
							{ datetime_start: { [Op.lte]: datetime_end } }
						]
					},
					{
						[Op.and]: [
							{ datetime_start: { [Op.lte]: datetime_start } },
							{ datetime_end: { [Op.gte]: datetime_end } }
						]
					}
				]
			}
		});

		//schedule tabrakan
		if (checkAvailable.length !== 0) {
			const error = new Error('Can\'t add new schedule due to overlapping time.');
			error.statusCode = 400;
			throw error;
		}

		const newMeeting = await Meeting.create({
			name,
			description,
			place,
			datetime_start,
			datetime_end,
			duration_minute,
			teacherId: currentUser.id
		});

		const newMeetingId = newMeeting.id;

		let tempTime = new Date(datetime_start); // Convert datetime_start to a Date object
		let endTime = new Date(datetime_end); // Convert datetime_end to a Date object

		while (tempTime.getTime() + duration_minute * 60000 <= endTime.getTime()) {
				// Add new data to the meeting_details table
				await MeetingDetail.create({
						datetime_start: tempTime,
						datetime_end: new Date(tempTime.getTime() + duration_minute * 60000), // Add duration in minutes
						meetingId: newMeetingId,
						studentId: null
				});

				// Add duration_minute to tempTime
				tempTime = new Date(tempTime.getTime() + duration_minute * 60000); // Add duration in minutes
		}


		res.status(200).json({
			status: "Success",
			message: "Successfully add new schedule",
		})
	} catch (error) {
		res.status(error.statusCode || 500).json({
			status: "Error",
			message: error.message
		})
	}
}

const getMeetingDetails = async (req, res, next) => {
	try {
			const authorization = req.headers.authorization;
			const { meetingId } = req.params;
			let token;
			if (authorization !== null && authorization.startsWith("Bearer ")) {
					token = authorization.substring(7);
			} else {
					const error = new Error("You need to login");
					error.statusCode = 403;
					throw error;
			}
			const decoded = jwt.verify(token, key);
			const currentUser = await User.findOne({
					where: {
							id: decoded.userId
					}
			});
			if (!currentUser) {
					const error = new Error(`User with ID ${decoded.userId} doesn't exist!`);
					error.statusCode = 400;
					throw error;
			}
			const meeting = await Meeting.findOne({
					where: { id: meetingId },
					attributes: ['id', 'name', 'description', 'place', 'datetime_start', 'datetime_end', 'duration_minute', 'teacherId'],
					include: {
							model: User,
							as: 'teacher',
							attributes: ['fullName']
					}
			});
			const meeting_details = await MeetingDetail.findAll({
					where: { meetingId: meetingId },
					attributes: ['id', 'datetime_start', 'datetime_end', 'studentId']
			});

			// Attach meeting_details to the meeting object
			meeting.setDataValue('scheduleList', meeting_details);

			res.status(200).json({
					status: "Success",
					message: `Successfully fetch meeting with id ${meetingId}`,
					meeting: meeting
			});
	} catch (error) {
			res.status(error.statusCode || 500).json({
					status: "Error",
					message: error.message
			});
	}
}


module.exports = {
	createSchedule, getMeetingDetails
}