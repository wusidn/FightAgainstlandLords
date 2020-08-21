export const MESSAGE_TYPE = {
	PING: "PING",
};

export interface Request {
	id: string;
	type: string;
	from: string;
	send_time: Date;
	data?: string;
}

export interface Response {
	request_id: string;
	recv_time: Date;
	status: number;
	data?: string;
}
