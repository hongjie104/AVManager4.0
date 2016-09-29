package com.avManager.model.data
{
	import com.adobe.utils.DateUtil;

	public class Video extends Data
	{
		
		private var _code:String;
		
		private var _date:Date;
		
		private var _category:Vector.<String>;
		
		private var _series:String;
		
		private var _actress:Vector.<String>;
		
		private var _score:int;
		
		private var _isDesired:Boolean;
		
		public function Video()
		{
			super();
		}

		public function get isDesired():Boolean
		{
			return _isDesired;
		}

		public function set isDesired(value:Boolean):void
		{
			_isDesired = value;
		}

		public function get score():int
		{
			return _score;
		}

		public function set score(value:int):void
		{
			_score = value;
		}

		public function get actress():Vector.<String>
		{
			return _actress;
		}

		public function set actress(value:Vector.<String>):void
		{
			_actress = value;
		}

		public function get series():String
		{
			return _series;
		}

		public function set series(value:String):void
		{
			_series = value;
		}

		public function get category():Vector.<String>
		{
			return _category;
		}

		public function set category(value:Vector.<String>):void
		{
			_category = value;
		}

		public function get date():Date
		{
			return _date;
		}

		public function set date(value:Date):void
		{
			_date = value;
		}

		public function get code():String
		{
			return _code;
		}

		public function set code(value:String):void
		{
			_code = value;
		}
		
		override public function createWithJson(json:Object):void {
			super.createWithJson(json);
			code = json.code;
			date = new Date(json.date);
			category = arrToVector(json.category);
			actress = arrToVector(json.actress);
			series = json.series;
			score = json.score;
			isDesired = json.isDesired == 1;
		}
		
		private function arrToVector(arr:Array):Vector.<String> {
			var result:Vector.<String> = new Vector.<String>();
			for each(var val:String in arr){
				result.push(val);
			}
			return result;
		}
		
	}
}