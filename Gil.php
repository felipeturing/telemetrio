<?php
namespace MyApp;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Psr\Http\Message\RequestInterface;

class Gil implements MessageComponentInterface {
	protected $clients;

	private $clientesNavegadores;

	public function __construct() {
		$this->clients = new \SplObjectStorage;
		$this->clientesNavegadores = new \SplObjectStorage;
	}

	public function onOpen(ConnectionInterface $conn) {
		$this->clients->attach($conn);

		echo "New connection! ({$conn->resourceId})\n";

		//$conn->send("Estoy vivo.");
	}

	public function onMessage(ConnectionInterface $from, $msg) {
		//~ $numRecv = count($this->clients) - 1;
		//~ echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
			//~ , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
		if(
			$msg[0] == 'e'
			&& $msg[1] == 'g'
			&& $msg[2] == 'o'
		) {
			$this->clientesNavegadores->attach( $from );
		}

		foreach($this->clientesNavegadores as $navegador) {
			$navegador->send( $msg );
		}
	}

	public function onClose(ConnectionInterface $conn) {
		$this->clients->detach($conn);
		$this->clientesNavegadores->detach( $conn );

		echo "Connection {$conn->resourceId} has disconnected\n";
	}

	public function onError(ConnectionInterface $conn, \Exception $e) {
	}
}
