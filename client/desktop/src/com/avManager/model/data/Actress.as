package com.avManager.model.data
{
	public class Actress extends Data
	{
		
		private var _alias:String;
		
		private var _birthday:Date;
		
		private var _height:int;
		
		private var _bust:int;
		
		private var _waist:int;
		
		private var _hip:int;
		
		private var _cup:String;
		
		private var _score:int;
		
		private var _javBusCode:String;
		
		public function Actress()
		{
			super();
		}

		public function get javBusCode():String
		{
			return _javBusCode;
		}

		public function set javBusCode(value:String):void
		{
			_javBusCode = value;
		}

		public function get score():int
		{
			return _score;
		}

		public function set score(value:int):void
		{
			_score = value;
		}

		public function get cup():String
		{
			return _cup;
		}

		public function set cup(value:String):void
		{
			_cup = value;
		}

		public function get hip():int
		{
			return _hip;
		}

		public function set hip(value:int):void
		{
			_hip = value;
		}

		public function get waist():int
		{
			return _waist;
		}

		public function set waist(value:int):void
		{
			_waist = value;
		}

		public function get bust():int
		{
			return _bust;
		}

		public function set bust(value:int):void
		{
			_bust = value;
		}

		public function get height():int
		{
			return _height;
		}

		public function set height(value:int):void
		{
			_height = value;
		}

		public function get birthday():Date
		{
			return _birthday;
		}

		public function set birthday(value:Date):void
		{
			_birthday = value;
		}

		public function get alias():String
		{
			return _alias;
		}

		public function set alias(value:String):void
		{
			_alias = value;
		}
		
		override public function createWithJson(json:Object):void {
			super.createWithJson(json);
			alias = json.alias;
			birthday = new Date(json.birthday);
			height = json.height;
			bust = json.bust;
			score = json.score;
			waist = json.waist;
			hip = json.hip;
			cup = json.cup;
			javBusCode = json.javBusCode;
		}

	}
}