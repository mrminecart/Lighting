import array
import redis
import json
from ola.ClientWrapper import ClientWrapper

wrapper = None
TICK_INTERVAL = int(1000/30)  # in ms
universe_count = 1024
data = {}
r = redis.StrictRedis(host='localhost', port=6379, db=0)
p = r.pubsub()

def init():
  global data
  global p

  #Listen to redis
  p.subscribe('dmx_input')

def DmxSent(state):
  if not state.Succeeded():
    wrapper.Stop()

def SendDMXFrame():
  global data 

  # schdule a function call in 100ms
  # we do this first in case the frame computation takes a long time.
  wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)

  # send
  for universe, output in data.iteritems():
    wrapper.Client().SendDmx(universe, output, DmxSent)

  # Listen to redis

  message = p.get_message()

  if(message and message['type'] == 'message'):

    dmx_in = json.loads(message['data'])

    for universe, output in dmx_in.iteritems():
      universe = int(universe)

      if not universe in data:
        data[universe] = array.array('B')
        for i in xrange(0, 512):
          data[universe].append(0)

      for channel, value in output.iteritems():
        data[universe][int(channel)] = int(value)


# lets go
init()

wrapper = ClientWrapper()
wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)
wrapper.Run()

thread = p.run_in_thread(sleep_time=0.0001)
