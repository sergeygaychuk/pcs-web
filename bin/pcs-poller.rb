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
  puts "Retrying"
end

exit 1 unless running

%w(INT QUIT TERM).each do |signal|
  trap signal do
    running = false
  end
end

p "Started"
while running do
  sleep 1
end
File.unlink("/tmp/pcs-poller.pid")
puts
