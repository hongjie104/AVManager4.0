package com.avManager.model.data
{
	public class Data
	{
		
		protected var _id:String;
		
		protected var _name:String;
		
		public function Data()
		{
		}

		public function get name():String
		{
			return _name;
		}

		public function set name(value:String):void
		{
			_name = value;
		}

		public function get id():String
		{
			return _id;
		}

		public function set id(value:String):void
		{
			_id = value;
		}
		
		public function createWithJson(json:Object):void{
			id = json._id;
			name = json.name;
		}

	}
}