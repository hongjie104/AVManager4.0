package com.avManager.view.fetchActress
{
	public final class ToFetchActressData
	{
		
		private var _name:String = "!";
		private var _alias:String = "";
		private var _birthday:Date = new Date(1970, 0, 1);
		private var _height:int = 0;
		private var _bust:int = 0;
		private var _waist:int = 0;
		private var _hip:int = 0;
		private var _cup:String = "X";
		private var _javBusCode:String = "";
		
		public function ToFetchActressData()
		{
		}

		public function get javBusCode():String
		{
			return _javBusCode;
		}

		public function set javBusCode(value:String):void
		{
			_javBusCode = value;
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

		public function get name():String
		{
			return _name;
		}

		public function set name(value:String):void
		{
			_name = value;
		}
		
		public function reset():void{
			this._alias = "";
			this._birthday = new Date(1970, 0, 1);
			this._bust = 0;
			this._cup = "X";
			this._height = 0;
			this._hip = 0;
			this._javBusCode = "";
			this._name = "";
			this._waist = 0;
		}

	}
}