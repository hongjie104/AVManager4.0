package com.avManager.view.fetchVideo
{
	public final class ToFetchVideoData
	{
		
		private var _code:String;
		
		// 小图url
		private var _imgSUrl:String;
		
		private var _html:String;
		
		public function ToFetchVideoData()
		{
		}

		public function get html():String
		{
			return _html;
		}

		public function set html(value:String):void
		{
			_html = value;
		}

		public function get imgSUrl():String
		{
			return _imgSUrl;
		}

		public function set imgSUrl(value:String):void
		{
			_imgSUrl = value;
		}

		public function get code():String
		{
			return _code;
		}

		public function set code(value:String):void
		{
			_code = value;
		}

	}
}