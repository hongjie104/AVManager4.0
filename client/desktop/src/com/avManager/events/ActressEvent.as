package com.avManager.events
{
	import com.avManager.model.data.Actress;
	
	import org.libra.events.BaseEvent;
	
	public final class ActressEvent extends BaseEvent
	{
		
		public static const ACTRESS_EVENT:String = "actressEvent";
		
//		public static const SHOW_DETAIL:String = "showActressDetail";
		
		private var _actress:Actress;
		
		public function ActressEvent(subType:String, actress:Actress)
		{
			super(ACTRESS_EVENT, subType, actress);
		}

		public function get actress():Actress
		{
			return _actress;
		}

		public function set actress(value:Actress):void
		{
			_actress = value;
		}

	}
}