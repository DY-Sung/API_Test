export default class Drag {
	private _target: cc.Node = null;
	public get target() {
		return this._target;
	}
	private _targetCollider: cc.Collider = null;
	public get targetCollider(): cc.Collider {
		return this._targetCollider;
	}

	private _isTouched: boolean = false;
	public get isTouched() {
		return this._isTouched;
	}

	public interactable: boolean = false; // 드래그 노드 상호작용 가능 여부 테스트

	public initParent: cc.Node = null; // 드래그 노드의 초기 부모 노드
	public initPos: cc.Vec2 = null; // 드래그 노드의 초기 위치

	public TouchStartCallback: Function = null; // 터치 시작 시 실행
	public TouchMoveCallback: Function = null; // 터치 유지 도중 실행
	public TouchEndCallback: Function = null; // 터치 종료 시 실행

	public DragExitCallback: Function = null; // 터치 종료 시에 노드가 충돌한 콜라이더가 없을 경우 실행
	public CheckAnswerCallback: Function = null; // 터치 종료 시에 노드가 충돌한 콜라이더가 있을 경우 실행

	public CollisionEnterCallback: Function = null; // 타 콜라이더와 충돌 시작 시 실행
	public CollisionStayCallback: Function = null; // 타 콜라이더와 충돌 도중 실행
	public CollisionExitCallback: Function = null; // 타 콜라이더와 충돌 종료 시 실행

	otherCollisions: cc.Collider[] = []; // 현재 충돌 중인 모든 콜라이더의 배열

	constructor(target: cc.Node, collider?: cc.Collider) {
		this._target = target;
		this.target.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart, this);
		this.target.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
		this.target.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
		this.target.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

		this.initParent ??= this._target.getParent();
		this.initPos ??= this._target.getPosition();

		this._targetCollider =
			collider == (null || undefined) ?
				target.getComponent(cc.Collider)
			:	collider;
		console.log("collide name: " + this._targetCollider.node.name);
		if (this._targetCollider !== null) {
			this._targetCollider["onCollisionEnter"] =
				this.OnCollisionEnter.bind(this);
			this._targetCollider["onCollisionStay"] = this.OnCollisionStay.bind(this);
			this._targetCollider["onCollisionExit"] = this.OnCollisionExit.bind(this);
		}
	}

	private OnTouchStart(event: cc.Event.EventTouch) {
		if (!this.interactable) return;
		if (this.isTouched) return;

		this._isTouched = true;

		this.TouchStartCallback && this.TouchStartCallback();
	}

	private OnTouchMove(event: cc.Event.EventTouch) {
		if (!this.isTouched) return;

		const delta = event.getDelta();
		this.target.x += delta.x;
		this.target.y += delta.y;

		this.TouchMoveCallback && this.TouchMoveCallback();
	}

	private OnTouchEnd(event: cc.Event.EventTouch) {
		if (!this.isTouched) return;

		this._isTouched = false;

		this.TouchEndCallback && this.TouchEndCallback(event);

		if (this.otherCollisions.length) {
			this.CheckAnswerCallback && this.CheckAnswerCallback();
		} else {
			this.DragExitCallback && this.DragExitCallback();
		}
	}

	private OnCollisionEnter(other: cc.Collider, self: cc.Collider) {
		this.otherCollisions.push(other);

		this.CollisionEnterCallback && this.CollisionEnterCallback(other, self);
	}
	private OnCollisionStay(other: cc.Collider, self: cc.Collider) {
		this.CollisionStayCallback && this.CollisionStayCallback(other, self);
	}
	private OnCollisionExit(other: cc.Collider, self: cc.Collider) {
		this.otherCollisions = this.otherCollisions.filter(element => {
			return element !== other;
		});

		this.CollisionExitCallback && this.CollisionExitCallback(other, self);
	}

	/** 드래그 노드가 충돌 중인 콜라이더들 중 가장 가까운 콜라이더를 반환하는 함수 */
	public GetNearestCollider(): cc.Collider {
		let ret: cc.Collider = null;
		let minDistance: number = Number.MAX_SAFE_INTEGER;

		const location = this.target.parent.convertToWorldSpaceAR(
			this.target.getPosition()
		);

		for (let i = 0; i < this.otherCollisions.length; i++) {
			const currCollider = this.otherCollisions[i];
			const currWorldPos = currCollider.node.parent.convertToWorldSpaceAR(
				currCollider.node.getPosition()
			);

			const distance = cc.Vec2.distance(currWorldPos, location);

			if (distance < minDistance) {
				ret = currCollider;
				minDistance = distance;
			}
		}

		return ret;
	}
}
