#!/home/sergei/src/pcs-web/bin/rails runner

$0="pc-poller.rb"

running = false

3.times do
  begin
    pid_file = File.open("/tmp/pcs-poller.pid", File::WRONLY | File::EXCL | File::CREAT)
    pid_file.write("#{Process.pid}\n")
    pid_file.close

    running = true
    break
  rescue => error
    pid_file =  File.open("/tmp/pcs-poller.pid", File::RDONLY)
    old_pid = pid_file.gets.to_i
    pid_file.close
    old_cmd = "/proc/#{old_pid}/cmdline"
    if File.exist?(old_cmd)
      file = File.open(old_cmd)
      old_name = file.gets.strip
      file.close
      if old_name == $0
        puts "#{old_name} is already running as process #{old_pid}"
        exit 1
      end
    end
    File.unlink("/tmp/pcs-poller.pid")
  end
end

exit 1 unless running

%w(INT QUIT TERM).each do |signal|
  trap signal do
    p "Got signal"
    running = false
  end
end

puts "#{$0} started"

class DevicePoller
  def initialize
    @devices = {}
  end

  def poll
    Mongoid::QueryCache.enabled = false
    Device.all.find_all.each do |device|
      p " processing #{device.name}"
      if device.enabled?
        p "  enabled"
        next if !File.exist?(device.filepath)
        next if @devices[device.id]
        p "   starting"
        device.read_new_states
        listener = Listen.to(device.filepath) do |modified, added, removed|
          device.read_new_states
        end
        listener.start
        @devices[device.id] = listener
      else
        p "  disabled"
        next unless @devices[device.id]
        p "   stopping"
        @devices.delete(device.id).stop
      end
    end
  end

  def stop
    @devices.each do |key, value|
      @device.delete(key)
      value.stop
    end
  end
end

devices = {}
poller = DevicePoller.new

while running do
  poller.poll
  sleep 2
end
File.unlink("/tmp/pcs-poller.pid")
puts