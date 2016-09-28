package com.avManager.events
{
	import com.avManager.model.data.Actress;
	import com.avManager.model.data.Video;
	
	import org.libra.events.BaseEvent;
	
	public final class VideoEvent extends BaseEvent
	{
		
		public static const VIDEO_EVENT:String = "MyVideoEvent"; 
		
		public static const VIDEO_CLICKED:String = "videoClicked";
		
		private var _video:Video;
		
		private var _actress:Actress;
		
		public function VideoEvent(subType:String, video:Video = null, actress:Actress = null)
		{
			super(VIDEO_EVENT, subType, data);
			_video = video;
			_actress = actress;
		}

		public function get actress():Actress
		{
			return _actress;
		}

		public function set actress(value:Actress):void
		{
			_actress = value;
		}

		public function get video():Video
		{
			return _video;
		}

		public function set video(value:Video):void
		{
			_video = value;
		}

	}
}