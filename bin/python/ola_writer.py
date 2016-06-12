import array
import redis
import json
from ola.ClientWrapper import ClientWrapper

wrapper = None
TICK_INTERVAL = int(1000/30)  # in ms
data = array.array('B')
r = redis.StrictRedis(host='localhost', port=6379, db=0)
p = r.pubsub()

def init():
  global data
  global p

  #Listen to redis
  p.subscribe('dmx_input')

  #Init dmx data
  data = array.array('B')

  for i in xrange(0, 512):
    data.append(0)

def DmxSent(state):
  if not state.Succeeded():
    wrapper.Stop()

def SendDMXFrame():
  global data 

  # schdule a function call in 100ms
  # we do this first in case the frame computation takes a long time.
  wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)

  # send
  wrapper.Client().SendDmx(1, data, DmxSent)

  # Listen to redis

  message = p.get_message()

  if(message):
    try:
      dmx_in = json.loads(message['data'])

      for key, value in dmx_in.iteritems():
        data[int(key)] = value

    except:
      pass

# lets go
init()

wrapper = ClientWrapper()
wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)
wrapper.Run()

thread = p.run_in_thread(sleep_time=0.0001)
